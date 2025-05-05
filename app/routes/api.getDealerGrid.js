import { DealerGridDetails } from "../model/dashboardmodel";
export const loader = async ({ request }) => {
  const origin = request.headers.get("origin");

   
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
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return new Response(JSON.stringify({ error: "Missing shop param" }), {
        status: 400,
        headers,
      });
    }

    const data = await DealerGridDetails.find({ shop });
    return new Response(JSON.stringify({ status: 200, data }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
};
