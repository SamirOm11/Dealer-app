import { authenticate } from "../shopify.server";

const at = "webhooks.order_paid.jsx"
// const processWebhook = async ({ shop, payload, }) => {
//   try {
//     if (shop && payload) {
//       const orderData = payload;
//       const { customer, line_items } = orderData;
//       const NewcustomerId = customer.id;
//       const customerId = `gid://shopify/Customer/${NewcustomerId}`;

//       console.log(at, "customerId", customerId);

//       const productIds = line_items.map(item => `gid://shopify/Product/${item.product_id}`);

//       console.log(at, "productIds", productIds);


//       const customeremail = customer.email;
//       let customerHistory = await productPurchaseHistory.findOne({ customerId });
//       console.log(at, `Customer's purchase history found of customer with ID ${customerId}: `, customerHistory);

//       if (!customerHistory) {
//         // ============If no history found for this customer, create a new entry
//         await productPurchaseHistory.create({
//           customerId,
//           productIds,
//           customeremail,
//         });
//       } else {
//         // If history exists, update the productIds array
//         customerHistory.productIds = [...new Set([...customerHistory.productIds, ...productIds])];
//         await customerHistory.save();
//       }

//       console.log(at, "Purchase history saved or updated for order:", orderData);
//     } else {
//       console.log(at, "Webhook Error")
//       console.log(at, "Webhook Payload", payload)
//     }
//   } catch (error) {
//     console.log(at, 'error: ', error);
//   }
// }

export const action = async ({ request }) => {
  try {
    console.log("Received webhook request in orders");
    const { shop, payload, topic, } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);
    // processWebhook({ shop, payload, })
    return new Response();
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response();
  }
};
