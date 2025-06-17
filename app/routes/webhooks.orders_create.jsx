import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { shopifyGraphQLRequest } from "./utils/shopifyGraphqlRequestforDealer";
import { DealerGridDetails } from "../model/dashboardmodel";
import { MetafieldStatus } from "../model/metafieldCreated";
import { productDetails } from "../graphql/getProductDetails";
import { sendDealerEmail } from "./services/sendemail";
import { getOrderStatus } from "../graphql/getOrderFullfimentStatus";
// import { getOrderDetails } from "../graphql/getOrderDetails";
const at = "webhooks.order_create.jsx";

export const action = async ({ request }) => {
  console.log('Webhook triggered:', at);
  try {
    const { shop, payload, topic, session, admin } =
      await authenticate.webhook(request);
    // console.log("payload", payload);
    const orderId = payload.id;
    const attributes = payload.line_items[0].properties || [];
    const dealerName = attributes.find(
      (attr) => attr.name === "dealer_name",
    )?.value;
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
    const productGid = `gid://shopify/Product/${productId}`;
    if (!dealerName || !dealerEmail || !dealerCity || !dealerPincode) {
      console.error("Missing dealer info");
      return json({ success: false });
    }

    const accessToken = session.accessToken;

    const definitions = [
      { name: "Dealer Name", key: "dealer_name" },
      { name: "Dealer City", key: "dealer_city" },
      { name: "Dealer Email", key: "dealer_email" },
      { name: "Dealer Pincode", key: "dealer_pincode" },
    ];

    const existingStatus = await MetafieldStatus.findOne({ shop });
    if (
      !existingStatus ||
      !existingStatus.metafieldsCreated ||
      existingStatus === null
    ) {
      console.log("Creating metafield definitions...");
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

    const productName = productgraphqlresult.data.nodes[0].title;
    sendDealerEmail({
      to: dealerEmail,
      subject: `New Customer Order Received`,
      text: `Dear Dealer,
 
You have received a new order from a customer. Please find the order details below:
 
Order Name: ${payload.name}  
Product: ${productName}  
Pincode: ${dealerPincode}
 
Kindly proceed with processing this order as soon as possible.
 
Thank you,  
Dealer App Team`,
    });
    const orderDataResponse = await admin.graphql(getOrderStatus, {
      variables: { orderId: payload.admin_graphql_api_id },
    });
    const ordergraphqlresult = await orderDataResponse.json();
    const orderStatus =
      ordergraphqlresult.data.nodes[0].displayFulfillmentStatus;
    console.log("orderStatus", orderStatus);

    const infotodashboard = new DealerGridDetails({
      shop: shop,
      orderId: payload.admin_graphql_api_id,
      orderName: payload.name,
      dealerEmail: dealerEmail,
      customerEmail: payload?.customer?.email,
      pinCode: dealerPincode,
      productTitle: productName,
      financialStatus: payload.financial_status,
      customerName: payload.customer?.first_name,
      customerLastName: payload.customer?.last_name,
      quantity: payload.line_items[0].quantity,
      displayFulfillmentStatus: orderStatus,
    });
    const databseresponse = await infotodashboard.save();
    return { status: 200, databseresponse };
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response();
  }
};
