import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { DealerGridDetails } from "../model/dashboardmodel";
export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const url = new URL(request.url);
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");
    const searchQuery = url.searchParams.get("queryValue");
    console.log("searchQuery", searchQuery);
    const shop = session.shop;
    console.log("shop", shop);
    let query = { shop };
    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    if (searchQuery) {
      console.log("Inside searchQuery ");
      const searchQueryNumber = Number(searchQuery);

      query.$or = [
        { dealerEmail: { $regex: searchQuery, $options: "i" } },
        { customerEmail: { $regex: searchQuery, $options: "i" } },
        { productTitle: { $regex: searchQuery, $options: "i" } },
        ...(isNaN(searchQueryNumber) ? [] : [{ pinCode: searchQueryNumber }]), // Match pinCode if it's a number
      ];
    }

    console.log("query before data", query);
    const data = await DealerGridDetails.find(query);
    console.log("query", query);
    console.log("data", data);

    return { status: 200, DealerDeatails: data };
  } catch (error) {
    return json(
      { status: 500 },
      { error: "Internal Server Error from admindealermanagementgrid Api" },
    );
  }
};
