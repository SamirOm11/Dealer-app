export async function shopifyGraphQLRequest({
  shop,
  accessToken,
  query,
  variables = {},
}) {
  const endpoint = `https://${shop}/admin/api/2024-04/graphql.json`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const result = await res.json();
  if (result.errors || result.data?.metafieldsSet?.userErrors?.length > 0) {
    console.error("GraphQL Error:", JSON.stringify(result, null, 2));
    throw new Error("Shopify GraphQL failed");
  }
  return result;
}
