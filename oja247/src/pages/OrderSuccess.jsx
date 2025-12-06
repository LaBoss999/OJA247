import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../components/CartProvider";

export default function OrderSuccess(){
  const { id } = useParams();
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear guest cart on success
    clearCart();
  }, []);

  return (
    <div className="p-4">
      <h2>Payment successful</h2>
      <p>Your order <strong>{id}</strong> has been processed. Check your email for order details.</p>
      <p>Thank you for shopping with OJA247.</p>
    </div>
  );
}
