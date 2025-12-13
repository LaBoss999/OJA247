import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBusinessById } from "../services/api";
import AddProductForm from "../components/AddProductForm.jsx";
import ProductList from "../components/ProductList.jsx";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const BusinessDashboard = () => {
  const { businessId } = useParams();

  // ✅ All hooks must be called before any return statements
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  const fetchBusiness = async () => {
    try {
      const response = await getBusinessById(businessId);
      setBusiness(response.data);
    } catch (error) {
      console.error("Error fetching business:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = () => {
    setActiveTab("products");
  };

  // ✅ Safe conditional returns (after hooks)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-600">Business not found</div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          {/* Left: Business Info */}
          <div className="flex items-center gap-4">
            {business.logo && (
              <img
                src={business.logo}
                alt={business.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-gray-600">{business.category} • {business.location}</p>
            </div>
          </div>

          {/* Right: Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("products")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === "products"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              My Products
            </button>

            <button
              onClick={() => setActiveTab("add")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === "add"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Add Product
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === "settings"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Business Settings
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "products" && <ProductList businessId={businessId} />}

        {activeTab === "add" && (
          <AddProductForm
            businessId={businessId}
            onProductAdded={handleProductAdded}
          />
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Business Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <p className="mt-1 text-gray-900">{business.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="mt-1 text-gray-900">
                  {business.description || "No description"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <p className="mt-1 text-gray-900">{business.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <p className="mt-1 text-gray-900">{business.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact
                </label>
                <p className="mt-1 text-gray-900">{business.contact}</p>
              </div>
              <div className="pt-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Edit Business Info
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;