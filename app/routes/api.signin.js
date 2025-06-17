import { Dealer } from "../model/dealerModel";
import bcrypt from "bcrypt";
import { generateToken } from "./utils/jsonwebtoken";
import { jwtCookie } from "./utils/jwtCookie";
import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  const origin = request.headers.get("origin");
  console.log("origin: ", origin);

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };

  if (request.method === "OPTIONS") {
    return json(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");

  try {
    if (!email || !password) {
      return json(
        { status: 400, message: "All fields are required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const user = await Dealer.findOne({ email });

    if (!user) {
      return json(
        { status: 400, message: "User Not Found" },
        { status: 400, headers: corsHeaders },
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return json(
        { status: 400, message: "Incorrect Password" },
        { status: 400, headers: corsHeaders },
      );
    }

    const token = generateToken(user._id);
    console.log("token: ", token);

    const cookieHeader = await jwtCookie.serialize(token);
    console.log('cookieHeader: ', cookieHeader);

    return json(
      { status: 200, message: "Dealer Successfully login", token:token },
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Set-Cookie": cookieHeader,
        },
      },
    );
  } catch (error) {
    return json(
      { status: 500, message: "Internal server error during sign in" },
      { status: 500, headers: corsHeaders },
    );
  }
};
