import { authenticate } from "../shopify.server";
import { DealerGridDetails } from "../model/dashboardmodel";

const at = "webhook.orders_fulfilled.jsx";

export const action = async ({ request }) => {
  try {
    const { shop, payload, topic } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for shop ${shop}`);

    const orderId = payload.admin_graphql_api_id;
    const fulfillmentStatus = payload.fulfillment_status;

    console.log("orderId", orderId);
    console.log("fulfillmentStatus", fulfillmentStatus);

    const updateFulfillmentStatus = await DealerGridDetails.findOneAndUpdate(
      { orderId: orderId },
      { $set: { displayFulfillmentStatus: fulfillmentStatus } },
      { new: true, upsert: false },
    );

    console.log("updateFulfillmentStatus", updateFulfillmentStatus);
    console.log("payload", payload);

    return { status: 200, updateFulfillmentStatus };
  } catch (error) {
    console.error(at, "Webhook error: ", error);
    return new Response("Webhook error", { status: 500 });
  }
};
