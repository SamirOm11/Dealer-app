import mongoose from "mongoose";
import mongoose from "mongoose";

const CheckMetafieldSchema = new mongoose.Schema({
  shop: { type: String, required: true },
  metafieldsCreated: { type: Boolean, deafault: false },
});

export const MetafieldStatus =
  mongoose.models.MetafieldStatus ||
  mongoose.model("MetafieldStatus", CheckMetafieldSchema);
