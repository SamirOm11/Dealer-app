import { json } from "@remix-run/node";
import { Dealer } from "../model/dealerModel";
import bcrypt from "bcrypt";
import { generateToken } from "./utils/jsonwebtoken";
import { jwtCookie } from "./utils/jwtCookie";

export const action = async ({ request }) => {
  const origin = request.headers.get("origin");
  console.log("origin", origin);
  const headers = {
    "Access-Control-Allow-Origin": origin || "*", 
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true", 
  };

  const form = await request.formData();
  const dealerName = form.get("name");
  const dealerEmail = form.get("email");
  const dealerPassword = form.get("password");

  try {
    if (!dealerName || !dealerEmail || !dealerPassword) {
      return { status: 400, message: "All fields are required", headers };
    }

    const user = await Dealer.findOne({ dealerEmail });
    if (user) {
      return { status: 409, message: "user already exists", headers };
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dealerPassword, salt);

    const newUser = new Dealer({
      name: dealerName,
      email: dealerEmail,
      password: hashedPassword,
    });

    const token = generateToken(newUser?._id);
    const cookieHeader = await jwtCookie.serialize(token);
    console.log("cookieHeader", cookieHeader);

    const saveDealer = await newUser.save();
    return json(
      { status: 200, message: "Signup successful", user: saveDealer, token:token },
      {
        headers: {
          ...headers,
          "Set-Cookie": cookieHeader,
        },
      },
    );
  } catch (error) {
    return json(
      { status: 500 },
      { error: "Internal Server Error from signup Api" },
    );
  }
};
