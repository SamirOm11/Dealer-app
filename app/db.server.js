import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const dbconnection = () => {
  try {
    const dbURI = "mongodb://localhost:27017/Dealer_Details_app";
    mongoose.connect(dbURI);
  } catch (error) {
   console.log("Error",error) 
  }
};
