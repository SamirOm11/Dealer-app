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
    const shop = session.shop;
    let query = { shop };
    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    if (searchQuery) {
      query.$or = [
        { dealerEmail: { $regex: searchQuery, $options: "i" } },
        { customerEmail: { $regex: searchQuery, $options: "i" } },
        { productTitle: { $regex: searchQuery, $options: "i" } },
        { pinCode: { $regex: searchQuery, $options: "i" } },
      ];
    }

    // if (searchQuery) {
    //   query.$or = [
    //     { orderId: { $regex: searchQuery, $options: "i" } },
    //     { orderName: { $regex: searchQuery, $options: "i" } },
    //     { dealerEmail: { $regex: searchQuery, $options: "i" } },
    //     { customerName: { $regex: searchQuery, $options: "i" } },
    //     { customerEmail: { $regex: searchQuery, $options: "i" } },
    //     { pinCode: { $regex: searchQuery, $options: "i" } },
    //     { productTitle: { $regex: searchQuery, $options: "i" } },
    //   ];
    // }
    const data = await DealerGridDetails.find(query);
    console.log("data", data);

    return { status: 200, DealerDeatails: data };
  } catch (error) {
    return json(
      { status: 500 },
      { error: "Internal Server Error from admindealermanagementgrid Api" },
    );
  }
};
