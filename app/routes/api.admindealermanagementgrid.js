import { authenticate } from "../shopify.server";
import { DealerGridDetails } from "../model/dashboardmodel";
export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;
    console.log("shop", shop);
    const getDealerDetails = await DealerGridDetails.find({
      shop: shop,
    });
    console.log('getDealerDetails',getDealerDetails);
    return { status: 200, DealerDeatails: getDealerDetails };
  } catch (error) {
    return json(
      { status: 500 },
      { error: "Internal Server Error from admindealermanagementgrid Api" },
    );
  }
};
