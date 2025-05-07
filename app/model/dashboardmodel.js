import mongoose from "mongoose";

const DealerDetailsSchema = new mongoose.Schema(
  {
    shop: { type: String },
    orderId: { type: String },
    orderName: { type: String },
    dealerEmail: { type: String },
    customerName: { type: String },
    customerEmail: { type: String },
    pinCode: { type: Number },
    productTitle: { type: String },
  },
  { timestamps: true },
);

export const DealerGridDetails =
  mongoose.models.DealerGrid ||
  mongoose.model("DealerGrid", DealerDetailsSchema);
