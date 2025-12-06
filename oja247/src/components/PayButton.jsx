import React from "react";

/**
 * Simple button that will redirect user to Paystack hosted payment page
 * initializationData is the response.data.data returned by backend initialize endpoint
 */
export default function PayButton({ initializationData }) {
  const handleClick = () => {
    if (initializationData && initializationData.authorization_url) {
      window.location.href = initializationData.authorization_url;
    } else {
      alert("Payment not initialized. Try again.");
    }
  };

  return (
    <button onClick={handleClick} className="btn btn-success">
      Continue to Pay
    </button>
  );
}
