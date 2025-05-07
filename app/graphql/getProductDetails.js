export const productDetails = `query getProductDetails($productId:[ID!]!){
nodes(ids:$productId){
...on Product{
id
title
onlineStorePreviewUrl
handle
description
}
}
} `;


