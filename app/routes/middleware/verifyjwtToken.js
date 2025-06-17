import jwt from "jsonwebtoken";
import { Dealer } from "../../model/dealerModel";

const verifyJwtToken = async (token) => {
  console.log("token in verifyJwtToken: ", token);
  try {
    if (!token) {
      return { status: 401, message: "Unauthorized - No token provided" };
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return { status: 401, message: "Unauthorized - Invalid token" };
    }
    if (decoded.exp > Math.floor(Date.now() / 1000)) {
      console.log("Token is valid");
    }

    const currentUser = await Dealer.findById(decoded.userId).select(
      "-password",
    );
    console.log("currentUser", currentUser);
    if (!currentUser) {
      return { status: 404, message: "User not found" };
    }

    return { status: 200, user: currentUser, decoded };
  } catch (error) {
    return {
      status: 401,
      message: "Unauthorized - Invalid or expired token",
      error: error.message,
    };
  }
};
export default verifyJwtToken;
