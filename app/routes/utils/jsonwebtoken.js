import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  try {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token will expire in 1 minute
    });
  } catch (error) {
    return null;
  }
};