import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/api";
import { useCart } from "../context/CartContext";

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart } = useCart();
  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    note: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [paystackReady, setPaystackReady] = useState(false);

  useEffect(() => {
    const existingScript = document.querySelector("script[src='https://js.paystack.co/v1/inline.js']");

    if (existingScript) {
      if (window.PaystackPop) {
        setPaystackReady(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackReady(true);
    script.onerror = () => setPaystackReady(false);
    document.body.appendChild(script);
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">Add products before checking out.</p>
          <button
            onClick={() => navigate("/products")}
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const deliveryFee = deliveryMethod === "pickup" ? 0 : 2500;
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paystackPublicKey) {
      alert("Paystack public key is missing. Add VITE_PAYSTACK_PUBLIC_KEY to your .env file.");
      return;
    }

    const amountInKobo = Math.round(total * 100);
    const reference = `oja247-${Date.now()}`;

    try {
      await axiosInstance.post("/api/orders", {
        reference,
        customer: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          note: formData.note,
        },
        items: cartItems.map((item) => ({
          productId: item._id,
          name: item.name,
          category: item.category || "",
          quantity: item.quantity,
          price: Number(item.price || 0),
          image: item.images?.[0] || item.image || "",
        })),
        subtotal: Number(subtotal),
        deliveryFee: Number(deliveryFee),
        total: Number(total),
        deliveryMethod,
      });
    } catch (error) {
      console.error("Order creation error:", error);
      alert("We could not create your order. Please try again.");
      return;
    }

    if (!paystackReady || !window.PaystackPop) {
      alert("Paystack is still loading. Please wait a moment and try again.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: formData.email,
      amount: amountInKobo,
      currency: "NGN",
      ref: reference,
      metadata: {
        custom_fields: [
          { display_name: "Full Name", variable_name: "full_name", value: formData.fullName },
          { display_name: "Phone", variable_name: "phone", value: formData.phone },
          { display_name: "Address", variable_name: "address", value: formData.address },
          { display_name: "City", variable_name: "city", value: formData.city },
          { display_name: "Delivery Method", variable_name: "delivery_method", value: deliveryMethod },
          { display_name: "Order Note", variable_name: "order_note", value: formData.note || "" },
        ],
      },
      callback: function (response) {
        (async function () {
          try {
            const verificationResponse = await axiosInstance.post(`/api/orders/verify/${response.reference}`);

            if (verificationResponse.data?.order?.paymentStatus === "paid") {
              clearCart();
              navigate(`/payment-status?status=success&reference=${response.reference}`);
              return;
            }
          } catch (error) {
            console.error("Payment verification error:", error);
          }

          navigate(`/payment-status?status=failure&reference=${response.reference}`);
        })();
      },
      onClose: function () {
        console.log("Paystack checkout closed by user");
        navigate(`/payment-status?status=failure&reference=${reference}`);
      },
    });

    handler.openIframe();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/cart")}
          className="mb-6 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          ← Back to cart
        </button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1">Complete your order details below.</p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0803 000 0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="you@example.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery address</label>
                <textarea
                  name="address"
                  required
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="12 Market Road, Ikeja, Lagos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Lagos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery method</label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="delivery">Home Delivery</option>
                  <option value="pickup">Pickup</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order note (optional)</label>
                <textarea
                  name="note"
                  rows="3"
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Any delivery instructions?"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium"
            >
              Place Order
            </button>
          </form>

          <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-5">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-none last:pb-0">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    ₦{(Number(item.price || 0) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>₦{deliveryFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
