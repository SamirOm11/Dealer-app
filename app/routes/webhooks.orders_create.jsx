import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

const at = "webhooks.order_create.jsx";

export const action = async ({ request }) => {
  try {
    console.log("Received Webhook Request in");
    const { shop, payload, topic } = await authenticate.webhook(request);
    console.log("payload---, shop---", "topic", payload, shop, topic);
    return new Response();
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response();
  }
};





