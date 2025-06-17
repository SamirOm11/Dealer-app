import { createCookie } from "@remix-run/node";
export const jwtCookie = createCookie("jwt", {
  maxAge: 60* 60 * 24 * 7, // 7 days
  // httpOnly: true,
  // sameSite: "strict",
  secure: process.env.NODE_ENV === "development",
});
