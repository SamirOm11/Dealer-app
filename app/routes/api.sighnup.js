import { json } from "@remix-run/node";
import { Dealer } from "../model/dealerModel";
import bcrypt from "bcrypt";

export const action = async ({ request }) => {
  const origin = request.headers.get("origin");
  const headers = {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  const form = await request.formData();
  const dealerName = form.get("name");
  const dealerEmail = form.get("email");
  const dealerPassword = form.get("password");

  try {
    if (!dealerName || !dealerEmail || !dealerPassword) {
      return { status: 400, message: "All fields are required", headers };
    }
    // if (dealerPassword.length > 6) {
    //   return {
    //     status: 400,
    //     message: "Password must be atleast 6 characters",
    //     headers,
    //   };
    // }
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
    const saveDealer = await newUser.save();
    return { status: 200, saveDealer, headers };
  } catch (error) {
    return json(
      { status: 500 },
      { error: "Internal Server Error from signup Api" },
    );
  }
};
