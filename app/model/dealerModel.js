import mongoose from "mongoose";

const DealerSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
});

export const Dealer =
  mongoose.models.Dealer || mongoose.model("Dealer", DealerSchema);
