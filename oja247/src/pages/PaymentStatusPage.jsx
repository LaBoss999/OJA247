import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../services/api";
import Loader from "../components/Loader";
import useMinimumLoadingTime from "../hooks/useMinimumLoadingTime";

function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const showLoader = useMinimumLoadingTime(loading);

  const status = searchParams.get("status");
  const reference = searchParams.get("reference");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!reference) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/api/orders/reference/${reference}`);
        setOrder(response.data.order);
      } catch (error) {
        console.error("Error fetching order status", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [reference]);

  const isSuccess = status === "success";

  if (showLoader) {
    return <Loader text="Checking your payment status..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div
          className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
            isSuccess ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {isSuccess ? "✓" : "!"}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isSuccess ? "Payment Successful" : "Payment Not Completed"}
        </h1>

        <p className="text-gray-600 mb-6">
          {isSuccess
            ? "Your order has been placed and payment was received successfully."
            : "Your payment was not completed. You can try again or continue shopping."}
        </p>

        {reference && (
          <p className="text-sm text-gray-500 mb-6">
            Reference: <span className="font-semibold text-gray-800">{reference}</span>
          </p>
        )}

        {order && (
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-left mb-6">
            <p className="text-sm text-gray-500">Order status</p>
            <p className="font-semibold text-gray-900 capitalize">{order.status}</p>
            <p className="mt-2 text-sm text-gray-500">Total</p>
            <p className="font-bold text-gray-900">₦{Number(order.total || 0).toLocaleString()}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/products")}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium"
          >
            Continue Shopping
          </button>
          {!isSuccess && (
            <button
              onClick={() => navigate("/cart")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-3 rounded-lg font-medium"
            >
              Back to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentStatusPage;