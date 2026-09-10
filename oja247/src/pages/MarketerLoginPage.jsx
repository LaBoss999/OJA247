import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import marketerApi from "../services/marketerApi";
import Logo from "../assets/OJA247 VX1.png";

const MarketerLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await marketerApi.post("/api/marketers/login", formData);
      localStorage.setItem("marketerToken", data.token);
      navigate("/marketer-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <div className="flex justify-center mb-6">
            <img src={Logo} alt="OJA247" className="w-28" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
            Marketer Login
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              } shadow-lg`}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            <div className="text-center pt-4 border-t">
              <p className="text-xs sm:text-sm text-gray-600">
                Not a marketer yet?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register-marketer")}
                  className="text-green-600 font-semibold hover:text-green-700"
                >
                  Register here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MarketerLoginPage;
