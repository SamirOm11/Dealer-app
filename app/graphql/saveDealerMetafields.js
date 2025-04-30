export const saveDealer = ()=>{
    const mutation = `
    mutation CreateMetafield($input: MetafieldsSetInput!) {
      metafieldsSet(metafields: [$input]) {
        metafields {
          key
          namespace
          value
          type
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
}