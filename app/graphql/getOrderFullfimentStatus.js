export const getOrderStatus = `query getOrderStatus($orderId:[ID!]!){
nodes(ids:$orderId){
...on Order{
   displayFulfillmentStatus
  fulfillmentOrders(first: 10) {
    edges {
      node {
        status
      }
    }
  }
}}
}`;
