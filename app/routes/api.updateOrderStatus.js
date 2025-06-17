import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { fullfilledOrderStaus } from "../graphql/fullfilledOrderStatus";
import { getOrderDetails } from "../graphql/getOrderDetails";

export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const url = new URL(request.url);
    const orderId = url.searchParams.get("orderId");

    if (!orderId) {
      return json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // First get the order details to verify and extract line items
    const orderData = await admin.graphql(getOrderDetails, {
      variables: {
        orderId: [orderId],
      },
    });

    const orderDetails = orderData.data?.nodes?.[0];

    if (!orderDetails) {
      return json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order is already fulfilled
    if (orderDetails.fulfillmentStatus === "FULFILLED") {
      return json(
        { success: false, message: "Order is already fulfilled" },
        { status: 400 }
      );
    }

    // Prepare line items for fulfillment
    const lineItems = orderDetails.lineItems.edges.map(({ node }) => ({
      id: node.id,
      quantity: node.quantity,
    }));

    // Create fulfillment
    const fulfillmentResponse = await admin.graphql(fullfilledOrderStaus, {
      variables: {
        fulfillment: {
          orderId: orderId,
          lineItems: lineItems,
          notifyCustomer: true,
        },
        message: "Order fulfilled by dealer",
      },
    });

    const { fulfillmentCreate } = fulfillmentResponse.data;

    // Check for user errors
    if (fulfillmentCreate?.userErrors?.length > 0) {
      return json(
        {
          success: false,
          message: "Failed to fulfill order",
          errors: fulfillmentCreate.userErrors,
        },
        { status: 400 }
      );
    }

    // Return success response
    return json({
      success: true,
      message: "Order fulfilled successfully",
      fulfillment: fulfillmentCreate?.fulfillment,
    });
  } catch (error) {
    console.error("Error fulfilling order:", error);
    return json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
