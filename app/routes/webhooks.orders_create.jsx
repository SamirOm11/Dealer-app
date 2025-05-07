import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { shopifyGraphQLRequest } from "./utils/shopifyGraphqlRequestforDealer";
import { DealerGridDetails } from "../model/dashboardmodel";
import { MetafieldStatus } from "../model/metafieldCreated";
import { productDetails } from "../graphql/getProductDetails";
const at = "webhooks.order_create.jsx";

export const action = async ({ request }) => {
  try {
    console.log("Received Webhook Request in");
    const { shop, payload, topic, session, admin } =
      await authenticate.webhook(request);
    console.log("payload---:", payload);

    const orderId = payload.id;
    const attributes = payload.line_items[0].properties || [];
    console.log("attributes", attributes);
    const dealerName = attributes.find(
      (attr) => attr.name === "dealer_name",
    )?.value;
    console.log("dealerName", dealerName);
    const dealerCity = attributes.find(
      (attr) => attr.name === "dealer_city",
    )?.value;
    const dealerEmail = attributes.find(
      (attr) => attr.name === "dealer_email",
    )?.value;
    const dealerPincode = attributes.find(
      (attr) => attr.name === "dealer_pincode",
    )?.value;
    const productId = payload.line_items[0].product_id;
    console.log("productId", productId);
    const productGid = `gid://shopify/Product/${productId}`;
    console.log("productGid", productGid);
    if (!dealerName || !dealerEmail || !dealerCity || !dealerPincode) {
      console.error("Missing dealer info");
      return json({ success: false });
    }

    const accessToken = session.accessToken;
    console.log("accessToken--", accessToken);

    const definitions = [
      { name: "Dealer Name", key: "dealer_name" },
      { name: "Dealer City", key: "dealer_city" },
      { name: "Dealer Email", key: "dealer_email" },
      { name: "Dealer Pincode", key: "dealer_pincode" },
    ];

    const existingStatus = await MetafieldStatus.findOne({ shop });

    if (!existingStatus || !existingStatus.metafieldsCreated) {
      let allCreated = true;

      for (const def of definitions) {
        const mutation = `
      mutation {
        metafieldDefinitionCreate(definition: {
          name: "${def.name}",
          namespace: "custom",
          key: "${def.key}",
          type: "single_line_text_field",
          ownerType: ORDER,
          visibleToStorefrontApi: false,
          pin:true
        }) {
          createdDefinition {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

        const response = await shopifyGraphQLRequest({
          shop,
          accessToken,
          query: mutation,
        });

        const errors = response?.data?.metafieldDefinitionCreate?.userErrors;

        if (errors?.length > 0) {
          console.log(`${def.key} definition error:`, errors);
          allCreated = false;
        } else {
          console.log(`${def.key} definition created.`);
        }
      }

      if (allCreated) {
        await MetafieldStatus.updateOne(
          { shop },
          { $set: { metafieldsCreated: true } },
          { upsert: true },
        );
      }
    }

    const metafieldInputs = [
      {
        key: "dealer_name",
        value: dealerName,
      },
      {
        key: "dealer_city",
        value: dealerCity,
      },
      {
        key: "dealer_email",
        value: dealerEmail,
      },
      {
        key: "dealer_pincode",
        value: dealerPincode,
      },
    ];

    const setMetafieldMutation = `
    mutation SetMetafields($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      key
      namespace
      value
      type
    }
    userErrors {
      field
      message
    }
  }
}
`;

    const variables = {
      metafields: metafieldInputs.map((input) => ({
        ownerId: `gid://shopify/Order/${orderId}`,
        namespace: "custom",
        key: input.key,
        type: "single_line_text_field",
        value: input.value,
      })),
    };

    const result = await shopifyGraphQLRequest({
      shop,
      accessToken,
      query: setMetafieldMutation,
      variables,
    });

    if (result.data.metafieldsSet.userErrors.length > 0) {
      console.error(
        "Metafield creation errors:",
        result.data.metafieldsSet.userErrors,
      );
    } else {
      console.log("All dealer metafields created successfully.");
    }

    const productDataResponse = await admin.graphql(productDetails, {
      variables: { productId: productGid },
    });
    const productgraphqlresult = await productDataResponse.json();

    console.log("productgraphqlresult", productgraphqlresult);
    const productName = productgraphqlresult.data.nodes[0].title;
    console.log("productName", productName);

    const infotodashboard = new DealerGridDetails({
      shop: shop,
      orderId: payload.admin_graphql_api_id,
      orderName: payload.name,
      dealerEmail: dealerEmail,
      customerEmail: payload?.customer?.email,
      pinCode: dealerPincode,
      productTitle: productName,
    });
    console.log("infotodashboard", infotodashboard);
    await infotodashboard.save();

    return new Response("Metafield saved", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response();
  }
};
