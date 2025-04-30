import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { shopifyGraphQLRequest } from "./utils/shopifyGraphqlRequestforDealer";
import { DealerGridDetails } from "../model/dashboardmodel";

const at = "webhooks.order_create.jsx";

export const action = async ({ request }) => {
  try {
    console.log("Received Webhook Request in");
    const { shop, payload, topic, session } =
      await authenticate.webhook(request);
    console.log(
      "payload---, shop---",
      "topic",
      "session-----",
      payload,
      shop,
      topic,
      session,
    );

    const orderId = payload.id;
    const attributes = payload.note_attributes || [];

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
    if (!dealerName || !dealerEmail || !dealerCity || !dealerPincode) {
      console.error("Missing dealer info");
      return json({ success: false });
    }

    const accessToken = session.accessToken;
    console.log("accessToken--", accessToken);

    const mutation = `
    mutation CreateMetafield($input: MetafieldsSetInput!) {
      metafieldsSet(metafields: [$input]) {
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
      input: {
        ownerId: `gid://shopify/Order/${orderId}`,
        namespace: "custom",
        key: "dealer_info",
        type: "json",
        value: JSON.stringify({
          dealer_name: dealerName,
          dealer_city: dealerCity,
          dealer_email: dealerEmail,
          dealer_pincode: dealerPincode,
        }),
      },
    };
    await shopifyGraphQLRequest({
      shop,
      accessToken,
      query: mutation,
      variables,
    });

    console.log("✅ Dealer metafield saved to order:", orderId);

    const infotodashboard = new DealerGridDetails({
      shop: shop,
      orderId: payload.admin_graphql_api_id,
      orderName: payload.name,
      dealerEmail: dealerEmail,
      customerEmail: payload?.customer?.email,
      pincode: dealerPincode,
    });
    await infotodashboard.save();

    return new Response("Metafield saved", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response();
  }
};
