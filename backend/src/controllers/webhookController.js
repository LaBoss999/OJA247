import crypto from 'crypto';
import { sendOrderEmailsToBuyerAndSeller } from '../services/emailService.js';
import { sendWhatsAppToSeller } from '../services/whatsappService.js';


const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;


export const paystackWebhook = async (req, res) => {
try {
// Paystack signs the event with your secret
const signature = req.headers['x-paystack-signature'];
const body = JSON.stringify(req.body);


const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');


if (signature !== hash) {
console.warn('Invalid webhook signature');
return res.status(400).send('Invalid signature');
}


const event = req.body;


// Interested in charge.success
if (event.event === 'charge.success') {
const data = event.data;
const reference = data.reference;
const amount = data.amount / 100;
const email = data.customer?.email;


// mark transaction
await Transaction.findOneAndUpdate({ reference }, { status: 'success', meta: data }, { upsert: true });


// If orderId was passed in metadata
const orderId = data.metadata?.orderId;


if (orderId) {
const order = await Order.findById(orderId);
if (order) {
// Basic check to match amount
if (Math.abs(order.amount - amount) > 0.01) {
console.warn('Amount mismatch for order', orderId);
}


order.paid = true;
order.status = 'paid';
order.paymentRef = reference;
await order.save();


// Send emails to buyer & seller
await sendOrderEmailsToBuyerAndSeller(order);


// Send WhatsApp to seller (if configured)
await sendWhatsAppToSeller(order);
}
}
}


// Acknowledge receipt quickly
res.status(200).json({ received: true });
} catch (err) {
console.error('webhook error', err);
res.status(500).send('Webhook handling error');
}
};