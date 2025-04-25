import { json } from "@remix-run/react";
import { request } from "http";
import { authenticate } from "../shopify.server";
import { readDealerCsv } from "./utils/utils";
import { authenticate } from "../shopify.server";
export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.public.appProxy(request);

    console.log("inside trycatch");
    const url = new URL(request.url);
    const pincode = url.searchParams.get("pinCode");
    console.log("pincode", pincode);
    if (!pincode) {
      return json({ success: false, error: "Pincode not found" });
    }
    const dealerDetails = await readDealerCsv(pincode);
    console.log("dealerDetails", dealerDetails);
    return json({ status: 200, dealerDetails: dealerDetails });
  } catch (error) {
    return json(
      { status: 500 },
      { error: "Internal Server Error from GetDealer Api" },
    );
  }
};
