import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  orderName: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: String,
  },
});

export const Orders =
  mongoose.models.Orders || mongoose.model.Orders("Orders", orderSchema);
