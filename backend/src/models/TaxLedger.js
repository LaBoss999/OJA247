import mongoose from "mongoose";

// One entry per paid order — accrued the moment the order's payment
// succeeds (see markOrderPaid in orderController.js), so this ledger is
// always in sync with real collected VAT rather than something computed
// separately/later. No live split at payment time (see the business plan
// doc) — this is purely internal bookkeeping until it's actually remitted,
// which an admin marks by hand in the Tax Ledger admin tab (no automated
// remittance/batching yet — not needed until filing is actually due).
const TaxLedgerSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    orderReference: { type: String, required: true },
    orderTotal: { type: Number, required: true },
    pssCharge: { type: Number, required: true }, // platform service fee this tax is calculated against
    taxRate: { type: Number, required: true }, // e.g. 0.075 for 7.5% VAT
    taxAmount: { type: Number, required: true },
    taxStatus: { type: String, enum: ["accrued", "remitted"], default: "accrued" },
    remittedAt: { type: Date, default: null },
    remittanceNote: { type: String, default: "" }, // free-text: reference number, filing period, etc.
  },
  { timestamps: true }
);

TaxLedgerSchema.index({ taxStatus: 1, createdAt: -1 });

export default mongoose.model("TaxLedger", TaxLedgerSchema);