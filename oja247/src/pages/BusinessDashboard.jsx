import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance, { getBusinessById } from "../services/api";
import AddProductForm from "../components/AddProductForm.jsx";
import ProductList from "../components/ProductList.jsx";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import Loader from "../components/Loader";
import useMinimumLoadingTime from "../hooks/useMinimumLoadingTime";

const BusinessDashboard = () => {
  const { businessId } = useParams();

  // ✅ All hooks must be called before any return statements
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    contact: "",
    logo: "",
    banner: "",
  });

  const showLoader = useMinimumLoadingTime(loading);

  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  useEffect(() => {
    if (business) {
      setEditForm({
        name: business.name || "",
        description: business.description || "",
        category: business.category || "",
        location: business.location || "",
        contact: business.contact || "",
        logo: business.logo || "",
        banner: business.banner || "",
      });
    }
  }, [business]);

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

  const handleEditFieldChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageUpload = (event) => {
    const { name, files } = event.target;
    const file = files && files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please upload a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Please upload an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setEditForm((prev) => ({ ...prev, [name]: result }));
      setFormError("");
    };
    reader.readAsDataURL(file);
  };

  const saveBusinessChanges = async () => {
    try {
      setSaving(true);
      setFormError("");

      const response = await axiosInstance.put(`/api/businesses/${businessId}`, {
        ...editForm,
        socialLinks: business.socialLinks || {},
        highlights: business.highlights || [],
      });

      setBusiness(response.data);
      setIsEditing(false);
    } catch (error) {
      setFormError(error.response?.data?.message || "Unable to update your business information right now.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Safe conditional returns (after hooks)
  if (showLoader) {
    return <Loader text="Loading dashboard..." />;
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      <div
        className="relative h-60 sm:h-72 overflow-hidden"
        style={{
          backgroundImage: business.banner ? `url(${business.banner})` : "linear-gradient(135deg, #16a34a, #facc15)",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/60 via-emerald-900/30 to-yellow-500/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-6 h-full flex items-end justify-between gap-4">
          <div className="flex items-center gap-4 pb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-yellow-400 text-xl font-black text-white">
                  {business.name?.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-green-100">Vendor dashboard</p>
              <h1 className="text-3xl sm:text-4xl font-black mt-1">{business.name}</h1>
              <p className="text-sm sm:text-base text-green-50 mt-1">{business.category} • {business.location}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/15 border border-white/30 text-white rounded-xl hover:bg-white/20 transition backdrop-blur-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-3 sm:gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("products")}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === "products"
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              My Products
            </button>

            <button
              onClick={() => setActiveTab("add")}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === "add"
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Add Product
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === "settings"
                  ? "border-green-600 text-green-700"
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
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-green-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 text-sm font-semibold">
                Live profile
              </span>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            {!isEditing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Name</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{business.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-gray-700">{business.description || "No description added yet."}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <p className="mt-1 text-gray-900">{business.category}</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="mt-1 text-gray-900">{business.location}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact</label>
                      <p className="mt-1 text-gray-900">{business.contact}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profile image</label>
                      <div className="mt-2 flex items-center gap-3">
                        {business.logo ? (
                          <img src={business.logo} alt={business.name} className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-100 to-yellow-100 text-green-700 font-bold flex items-center justify-center">N/A</div>
                        )}
                        <span className="text-sm text-gray-500">{business.logo ? "Uploaded and in use" : "No profile image added yet"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-yellow-500 text-white font-semibold rounded-xl hover:opacity-95 transition shadow-md"
                  >
                    Edit Business Info
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={editForm.category}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select category</option>
                      <option value="Food">Food & Drinks</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Tech">Tech & Electronics</option>
                      <option value="Beauty">Beauty & Health</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows="4"
                    value={editForm.description}
                    onChange={handleEditFieldChange}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                    <input
                      type="text"
                      name="contact"
                      value={editForm.contact}
                      onChange={handleEditFieldChange}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo image</label>
                    <input
                      type="file"
                      accept="image/*"
                      name="logo"
                      onChange={handleEditImageUpload}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-green-100 file:px-3 file:py-2 file:text-green-700"
                    />
                    {editForm.logo && (
                      <img src={editForm.logo} alt="Logo preview" className="mt-3 h-20 w-20 rounded-xl object-cover border border-gray-200" />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banner image</label>
                    <input
                      type="file"
                      accept="image/*"
                      name="banner"
                      onChange={handleEditImageUpload}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-yellow-100 file:px-3 file:py-2 file:text-yellow-700"
                    />
                    {editForm.banner && (
                      <img src={editForm.banner} alt="Banner preview" className="mt-3 h-20 w-full rounded-xl object-cover border border-gray-200" />
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormError("");
                    }}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveBusinessChanges}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-yellow-500 text-white font-semibold disabled:opacity-70"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;