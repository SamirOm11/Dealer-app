import { shopifyGraphQLRequest } from "./shopifyGraphqlRequestforDealer";
export const createMetafieldDefination = async ({ shop, accessToken }) => {
  const definitions = [
    { name: "Dealer Name", key: "dealer_name" },
    { name: "Dealer City", key: "dealer_city" },
    { name: "Dealer Email", key: "dealer_email" },
    { name: "Dealer Pincode", key: "dealer_pincode" },
  ];
  for (const def of definitions) {
    const mutation = `
            mutation {
          metafieldDefinitionCreate(definition: {
            name: "${def.name}",
            namespace: "custom",
            key: "${def.key}",
            type: "single_line_text_field",
            ownerType: ORDER,
            visibleToStorefrontApi: false
          }) {
            createdDefinition {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
    `;

    const response = await shopifyGraphQLRequest({
      shop,
      accessToken,
      query: mutation,
    });
    console.log("response---", response);
    if (response.data.metafieldDefinitionCreate.userErrors.length > 0) {
      console.log(
        `${def.key} definition error:`,
        response.data.metafieldDefinitionCreate.userErrors,
      );
    } else {
      console.log(`${def.key} definition created.`);
      return response;
    }
  }
};
