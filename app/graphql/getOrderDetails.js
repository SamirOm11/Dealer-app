export const getOrderDetails = `query getOrderDetails($orderId:[ID!]!){
  nodes(ids:$orderId){
    ...on Order{
      id
      name
      fulfillmentStatus
      lineItems(first: 10) {
        edges {
          node {
            id
            title
            quantity
            variant {
              id
              title
              product {
                id
                title
                onlineStorePreviewUrl
                handle
                description
              }
            }
          }
        }
      }
    }
  }
}`;