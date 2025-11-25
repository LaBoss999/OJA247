import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-5xl font-bold mb-6">Welcome to OJA247</h1>
      <p className="text-lg mb-10 text-center max-w-md">
        Discover small businesses near you or register your own business to get started!
      </p>

      <div className="flex gap-6">
        <button
          onClick={() => navigate("/business-form")}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Register Your Business
        </button>
        <button
          onClick={() => navigate("/businesses")}
          className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          View Businesses
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
