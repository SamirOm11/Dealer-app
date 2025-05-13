import { Dealer } from "../model/dealerModel";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
export const action = async ({ request }) => {
  // const appUrl = new URL(request.url).origin; //Current app url
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  console.log("password", password);

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

    return { status: 200, message: "Dealer Successfully login" };
  } catch (error) {
    return { status: 500, error: "Internal server error during sign in" };
  }
};
