export const getProductByTitle = async (title) => {
  console.log("title", title);
  const query = `
  {
    products(first: 1, query: "title:'${title}'") {
      edges {
        node {
          id
          title
          description
          variants(first: 10) {
            edges {
              node {
                price
              }
            }
          }
        }
      }
    }
  }`;

  const response = await fetch(
    "https://test-dev911.myshopify.com/api/2024-04/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token":process.env.SHOPIFY_ACCESS_TOKEN,
        "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    },
  );

  console.log("response", response);

  const result = await response.json();
  if (result.errors) {
    console.error("GraphQL Error:", JSON.stringify(result, null, 2));
    throw new Error("Shopify GraphQL failed");
  }
  return result.data;
};
