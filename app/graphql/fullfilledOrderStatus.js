export const fullfilledOrderStaus = `mutation fulfillmentCreate($fulfillment: FulfillmentInput!, $message: String) {
  fulfillmentCreate(fulfillment: $fulfillment, message: $message) {
    fulfillment {
      id
      status
      trackingInfo {
        number
        url
        company
      }
      createdAt
      location {
        id
        name
      }
      lineItems {
        edges {
          node {
            id
            title
            quantity
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}`;
