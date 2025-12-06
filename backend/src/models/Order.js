import mongoose from 'mongoose';


const orderItemSchema = new mongoose.Schema({
productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
name: String,
qty: Number,
price: Number,
businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' }
});


const orderSchema = new mongoose.Schema(
{
items: [orderItemSchema],
amount: { type: Number, required: true },
buyer: {
name: String,
email: String,
phone: String,
address: String
},
status: { type: String, default: 'pending' }, // pending, paid, processing, shipped
paid: { type: Boolean, default: false },
paymentRef: { type: String },
sellerNotified: { type: Boolean, default: false }
},
{ timestamps: true }
);


export default mongoose.model('Order', orderSchema);