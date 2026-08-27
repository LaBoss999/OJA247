// models/TaxLedger.js
const mongoose = require('mongoose');

const taxLedgerSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  orderTotal: { type: Number, required: true },
  pssCharge: { type: Number, required: true },   // platform fee this tax is calculated against
  taxRate: { type: Number, required: true },      // e.g. 0.075 for 7.5% VAT
  taxAmount: { type: Number, required: true },
  taxStatus: { type: String, enum: ['accrued', 'remitted'], default: 'accrued' },
  remittanceBatchId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaxRemittance', default: null },
}, { timestamps: true });

module.exports = mongoose.model('TaxLedger', taxLedgerSchema);