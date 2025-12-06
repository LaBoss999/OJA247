import Order from '../models/Order.js';


export const createOrder = async (req, res) => {
try {
const { items, amount, buyer } = req.body;


// Basic validation
if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty' });
if (!buyer || !buyer.email) return res.status(400).json({ error: 'Buyer info required' });


const newOrder = await Order.create({ items, amount, buyer });


res.status(201).json({ success: true, orderId: newOrder._id, order: newOrder });
} catch (err) {
console.error(err);
res.status(500).json({ error: err.message });
}
};


export const getOrder = async (req, res) => {
try {
const { id } = req.params;
const order = await Order.findById(id);
if (!order) return res.status(404).json({ error: 'Order not found' });
res.json({ order });
} catch (err) {
res.status(500).json({ error: err.message });
}
};