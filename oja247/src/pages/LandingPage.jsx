import React from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100 p-6 font-montserrat">
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1">
        <h1 className="text-7xl font-bold mb-6 text-black text-center">
          Welcome to OJA247
        </h1>
        <p className="text-lg mb-10 text-center max-w-md text-gray-800">
          Discover small businesses near you or register your own business to get started!
        </p>

        <div className="flex gap-6">
          {/* Primary Button: Green */}
          <button
            onClick={() => navigate("/business-form")}
            className="px-8 py-4 bg-[#1DB954] text-white rounded-lg hover:bg-[#159844] transition"
          >
            Register Your Business
          </button>

          {/* Secondary Button: Orange */}
          <button
            onClick={() => navigate("/businesses")}
            className="px-8 py-4 bg-[#FF7A00] text-black rounded-lg hover:bg-[#e66900] transition"
          >
            View Businesses
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full mt-12 py-8 border-t border-gray-300 bg-[#121212] text-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} OJA247. All rights reserved.</p>

          {/* Social Links */}
          <div className="flex gap-4">
            <a href="#" className="text-[#FF7A00] hover:text-[#FFC107] transition">
              <FaFacebookF />
            </a>
            <a href="#" className="text-[#FF7A00] hover:text-[#FFC107] transition">
              <FaTwitter />
            </a>
            <a href="#" className="text-[#FF7A00] hover:text-[#FFC107] transition">
              <FaInstagram />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
