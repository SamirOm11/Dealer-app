import mongoose from "mongoose";

const DealerSchema =new mongoose.Schema({
  name: {
    type: String,
  },
  pincode: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
  },
  address: {
    type: String,
  },
  phone: {
    type: Number,
  },
});

export const Dealer =
  mongoose.models.Dealer || mongoose.model("Dealer", DealerSchema);
