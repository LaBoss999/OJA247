import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    businessId: { type: String, default: null },
    name: { type: String, required: true },
    category: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const OrderVendorSchema = new mongoose.Schema(
  {
    businessId: { type: String, default: null },
    businessName: { type: String, default: "" },
    itemsSubtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "" },
      note: { type: String, default: "" },
    },
    items: [OrderItemSchema],
    vendors: [OrderVendorSchema],
    subtotal: { type: Number, required: true, min: 0 },
    serviceFee: { type: Number, required: true, min: 0, default: 0 },
    vat: { type: Number, required: true, min: 0, default: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    deliveryMethod: { type: String, default: "delivery" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);