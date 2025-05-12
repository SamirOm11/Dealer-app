import { Dealer } from "../model/dealerModel";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
export const action = async ({ request }) => {
  const appUrl = new URL(request.url).origin; //Current app url
  console.log("appUrl", appUrl);
  const form = await request.formData();
  const email = form.get("dealerEmail");
  const password = form.get("dealerPassword");
  console.log("password", password);
  const API_URL = process.env.API_URL;
  console.log("API_URL", API_URL);
  try {
    if (!email || !password) {
      return { status: 400, message: "All fields are required" };
    }
    const user = await Dealer.findOne({
      email,
    });
    console.log("user", user);
    if (!user) {
      return { status: 400, message: "User Not Found" };
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return { status: 400, message: "Incorrect Password" };
    }
    const dealerRes = await fetch(
      `${appUrl}/api/getDealerGrid?shop=test-dev911.myshopify.com`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      },
    );
    console.log("dealerRes", dealerRes);
    const dealerData = await dealerRes.json();
    console.log("dealerData", dealerData);
    return { status: 200, dealerData };
    // return { status: 200, message: "User Successfully login" };
  } catch (error) {
    return { status: 500, error: "Internal server error during sign in" };
  }
};
