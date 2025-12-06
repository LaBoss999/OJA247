import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CheckoutPage() {
  const navigate = useNavigate();

  // Load cart from localStorage
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Calculate total amount (in kobo)
  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0) * 100;

  // PAYSTACK PUBLIC KEY
  const paystackKey = "pk_test_e9e31461a63ce4c5788cdbe30ecf89a7623a6f78";

  const payNow = () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    if (!window.PaystackPop) {
      alert("Paystack failed to load. Check your internet connection.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: email,
      amount: totalAmount,
      currency: "NGN",

      metadata: {
        cart: cart,
      },

      callback: function (response) {
        alert("Payment successful! Reference: " + response.reference);

        // Clear cart
        localStorage.removeItem("cart");

        // Navigate to success page
        navigate("/order-success/" + response.reference);
      },

      onClose: function () {
        alert("Payment window was closed.");
      },
    });

    handler.openIframe();
  };

  if (cart.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold">Your cart is empty.</h2>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => navigate("/explore")}
        >
          Go Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>

        {cart.map((item, index) => (
          <div key={index} className="flex justify-between border-b py-3 text-lg">
            <span>{item.name}</span>
            <span>₦{item.price.toLocaleString()}</span>
          </div>
        ))}

        <div className="flex justify-between mt-4 text-xl font-bold">
          <span>Total:</span>
          <span>₦{(totalAmount / 100).toLocaleString()}</span>
        </div>
      </div>

      {/* Email Input */}
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <label className="font-semibold">Enter Email Address</label>
        <input
          type="email"
          placeholder="example@gmail.com"
          className="w-full mt-2 p-3 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Pay Button */}
      <button
        onClick={payNow}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-bold"
      >
        Pay Now with Paystack
      </button>
    </div>
  );
}

export default CheckoutPage;
