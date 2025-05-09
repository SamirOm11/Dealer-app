import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { DealerGridDetails } from "../model/dashboardmodel";

//Work is pending
export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const form = await request.formData();
  const dealerName = form.get("dealerName");
  const dealerEmail = form.get("dealerEmail");

  try {
  } catch (error) {
    return json(
      { status: 500 },
      { error: "Internal Server Error from SaveDealerGrid Api" },
    );
  }
};
