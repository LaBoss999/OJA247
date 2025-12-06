import axios from 'axios';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';


const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;


export const initializePayment = async (req, res) => {
try {
const { orderId, email, amount } = req.body;


// create transaction record
const tx = await Transaction.create({ email, amount, reference: `INIT_${Date.now()}` });


const response = await axios.post(
'https://api.paystack.co/transaction/initialize',
{ email, amount: amount * 100, metadata: { orderId, txId: tx._id } },
{ headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
);


// update transaction with reference from paystack
tx.reference = response.data.data.reference;
await tx.save();


res.json(response.data);
} catch (err) {
console.error('initializePayment error', err?.response?.data || err.message);
res.status(500).json({ error: 'Could not initialize payment' });
}
};


export const verifyPayment = async (req, res) => {
try {
const { reference, orderId } = req.body;


const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
});


const data = response.data;


if (data.status && data.data.status === 'success') {
// update transaction
await Transaction.findOneAndUpdate({ reference }, { status: 'success', meta: data.data });


// update order
const order = await Order.findById(orderId);
if (order) {
order.paid = true;
order.status = 'paid';
order.paymentRef = reference;
await order.save();
}


return res.json({ success: true, data });
}


res.status(400).json({ success: false, message: 'Payment not successful', data });
} catch (err) {
console.error('verifyPayment error', err?.response?.data || err.message);
res.status(500).json({ error: 'Verification failed' });
}
};