import mongoose from 'mongoose';


const transactionSchema = new mongoose.Schema(
{
email: { type: String, required: true },
amount: { type: Number, required: true },
reference: { type: String, required: true, unique: true },
status: { type: String, default: 'pending' },
meta: { type: Object }
},
{ timestamps: true }
);


export default mongoose.model('Transaction', transactionSchema);