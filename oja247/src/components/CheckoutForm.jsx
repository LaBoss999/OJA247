import React, { useState } from "react";
import { useCart } from "./CartProvider";

export default function CheckoutForm({ onOrderCreated }) {
  const { cart, total } = useCart();
  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buyer.name || !buyer.email || !buyer.phone) {
      return alert("Please provide name, email and phone.");
    }

    const items = cart.map(i => ({
      productId: i.productId,
      name: i.name,
      qty: i.qty,
      price: i.price,
      businessId: i.businessId
    }));

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, amount: total, buyer })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");
      onOrderCreated(data.orderId, data.order);
    } catch (err) {
      console.error(err);
      alert(err.message || "Could not create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input required placeholder="Full name" value={buyer.name} onChange={e => setBuyer({ ...buyer, name: e.target.value })} />
      <input required type="email" placeholder="Email" value={buyer.email} onChange={e => setBuyer({ ...buyer, email: e.target.value })} />
      <input required placeholder="Phone" value={buyer.phone} onChange={e => setBuyer({ ...buyer, phone: e.target.value })} />
      <textarea placeholder="Delivery address (if needed)" value={buyer.address} onChange={e => setBuyer({ ...buyer, address: e.target.value })} />
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? "Creating order..." : `Create Order (Pay ₦${total})`}
      </button>
    </form>
  );
}
