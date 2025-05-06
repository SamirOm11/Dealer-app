import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { createMetafieldDefination } from "./utils/createMetafieldsDefination";

export const loader = async ({ request }) => {
    console.log('function called');
  const {  shop, accessToken } = await authenticate(request);

  try {
    await createMetafieldDefination(shop, accessToken);
  } catch (err) {
    console.error("Error creating metafield definitions:", err);
  }

  return redirect(`/app`);
};
