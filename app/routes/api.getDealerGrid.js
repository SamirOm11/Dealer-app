import { json } from "@remix-run/node";
import { DealerGridDetails } from "../model/dashboardmodel";
import verifyJwtToken from "./middleware/verifyjwtToken";
import { parse } from "cookie";

export const loader = async ({ request }) => {
  // console.log('request',request);
  const origin = request.headers.get("origin");
  console.log("origin in header: ", origin);
  // const cookieHeader = request.headers.get("cookies") || "";
  // console.log('cookieHeader: ', cookieHeader);
  // const { email } = await request.json();

  const headers = {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  console.log("headers: ", headers);
  // if (request.method === "OPTIONS") {
  //   return new Response(null, { status: 204, headers });
  // }

  const autheHeader = request.headers.get("Authorization");
  console.log("autheHeader: ", autheHeader);

  if (!autheHeader || !autheHeader.startsWith("Bearer ")) {
    return { status: 401, error: "Missing or invalid Authorization header" };
  }
  const token = autheHeader.split(" ")[1];

  //token verification
  const payload = await verifyJwtToken(token);
  console.log("payload---: ", payload);

  if (payload.error) {
    return json(
      { error: "Invalid or expired token" },
      { status: 401, headers },
    );
  }
  try {
    const url = new URL(request.url);
    console.log("url", url);
    const email = url.searchParams.get("email");
    console.log("email after sighnin params", email);
    const shop = url.searchParams.get("shop");
    console.log("shop", shop);
    const fromDate = url.searchParams.get("fromDate");
    console.log("fromDate", fromDate);
    const toDate = url.searchParams.get("toDate");
    console.log("toDate", toDate);

    const from = fromDate ? new Date(fromDate + "T00:00:00.000Z") : undefined;
    const to = toDate ? new Date(toDate + "T23:59:59.999Z") : undefined;

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
          ...(from &&
            to && {
              createdAt: {
                $gte: from,
                $lte: to,
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
