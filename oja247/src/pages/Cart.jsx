import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const removeItem = (id) => {
    const updatedCart = cart.filter((item) => item._id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  // Paystack payment
  const handlePayment = () => {
    const paystackKey = "YOUR_PAYSTACK_PUBLIC_KEY"; // replace with your key
    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: "customer@example.com", // can be dynamic
      amount: totalAmount * 100, // in kobo
      currency: "NGN",
      ref: `OJA247-${Date.now()}`,
      onClose: function () {
        alert("Payment cancelled.");
      },
      callback: function (response) {
        alert(`Payment successful! Reference: ${response.reference}`);
        clearCart(); // empty cart after successful payment
        navigate("/"); // redirect after payment
      },
    });
    handler.openIframe();
  };

  if (cart.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Your cart is empty.</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item._id}
            className="flex justify-between items-center bg-white p-4 rounded-lg shadow"
          >
            <div>
              <h2 className="font-semibold text-lg">{item.name}</h2>
              <p className="text-gray-600">₦{item.price.toLocaleString()}</p>
            </div>
            <button
              onClick={() => removeItem(item._id)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Total: ₦{totalAmount.toLocaleString()}</h2>
        <button
          onClick={handlePayment}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
