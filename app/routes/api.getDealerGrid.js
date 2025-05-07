import { DealerGridDetails } from "../model/dashboardmodel";

export const loader = async ({ request }) => {
  const origin = request.headers.get("origin");
  console.log("origin", origin);
  const headers = {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  console.log("request.mehtod", request.method);
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");

    if (!shop) {
      return new Response(JSON.stringify({ error: "Missing shop param" }), {
        status: 400,
        headers,
      });
    }

    let query = { shop };
    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const data = await DealerGridDetails.find(query);

    return new Response(JSON.stringify({ status: 200, data }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
};
