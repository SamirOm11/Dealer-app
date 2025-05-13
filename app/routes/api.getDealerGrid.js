import { DealerGridDetails } from "../model/dashboardmodel";

export const loader = async ({ request }) => {
  const origin = request.headers.get("origin");
  // const { email } = await request.json();

  const headers = {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const url = new URL(request.url);
    console.log("url", url);
    const email = url.searchParams.get("email");
    console.log("email after sighnin params", email);
    const shop = url.searchParams.get("shop");
    console.log("shop", shop);
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");

    if (!shop) {
      return new Response(JSON.stringify({ error: "Missing shop param" }), {
        status: 400,
        headers,
      });
    }

    const getDealerDataByEmail = await DealerGridDetails.aggregate([
      {
        $match: {
          dealerEmail: email,
          shop: shop,
          ...(fromDate &&
            toDate && {
              createdAt: {
                $gte: new Date(fromDate),
                $lte: new Date(toDate),
              },
            }),
        },
      },
      {
        $group: {
          _id: "$email",
          totalOrders: { $sum: 1 },
          totalValue: { $sum: "$orderValue" },
          lastOrderDate: { $max: "$createdAt" },
          orders: { $push: "$$ROOT" },
        },
      },
    ]);

    console.log("getDealerDataByEmail", getDealerDataByEmail);

    return new Response(
      JSON.stringify({ status: 200, data: getDealerDataByEmail }),
      { headers },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
};
