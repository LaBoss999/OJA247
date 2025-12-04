import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalProducts: 0,
    totalUsers: 0,
    businessesByCategory: [],
  });
  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is admin on component mount
  useEffect(() => {
    console.log("Admin Dashboard - Current User:", user);

    if (!user) {
      console.log("No user found, redirecting to login");
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      console.log("User is not admin, redirecting to home");
      alert("Admin access only!");
      navigate("/");
      return;
    }

    console.log("User is admin, fetching data...");
    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      console.log(
        "Fetching admin data with token:",
        token ? "Token exists" : "No token"
      );

      // Fetch stats
      const statsRes = await axios.get(
        "http://localhost:5000/api/admin/stats",
        config
      );
      console.log("Stats fetched:", statsRes.data);
      setStats(statsRes.data);

      // Fetch all businesses
      const bizRes = await axios.get(
        "http://localhost:5000/api/businesses",
        config
      );
      console.log("Businesses fetched:", bizRes.data.length);
      setBusinesses(bizRes.data);

      // Fetch all users
      const userRes = await axios.get(
        "http://localhost:5000/api/admin/users",
        config
      );
      console.log("Users fetched:", userRes.data.length);
      setUsers(userRes.data);

      // Fetch all products
      const prodRes = await axios.get(
        "http://localhost:5000/api/products/search",
        config
      );
      console.log("Products fetched:", prodRes.data.length);
      setProducts(prodRes.data);
    } catch (error) {
      console.error(
        "Error fetching admin data:",
        error.response?.data || error.message
      );
      if (error.response?.status === 403) {
        alert("Access denied - Admin only");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id, currentStatus) => {
    if (
      !window.confirm(`${currentStatus ? "Remove from" : "Add to"} featured?`)
    )
      return;

    try {
      await axios.patch(
        `http://localhost:5000/api/admin/businesses/${id}/featured`,
        { featured: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Updated successfully!");
      fetchAllData();
    } catch (error) {
      console.error("Error toggling featured:", error);
      alert("Failed to update");
    }
  };

  const deleteBusiness = async (id, name) => {
    if (
      !window.confirm(
        `⚠️ DELETE "${name}"?\n\nThis will also delete:\n- All products\n- User account\n- Cannot be undone!`
      )
    ) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/businesses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Business deleted successfully");
      fetchAllData();
    } catch (error) {
      console.error("Error deleting business:", error);
      alert("❌ Failed to delete business");
    }
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Product deleted");
      fetchAllData();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const toggleUserBan = async (id, currentStatus, email) => {
    if (!window.confirm(`${currentStatus ? "UNBAN" : "BAN"} user "${email}"?`))
      return;

    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${id}/ban`,
        { banned: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`User ${currentStatus ? "unbanned" : "banned"}`);
      fetchAllData();
    } catch (error) {
      console.error("Error banning user:", error);
      alert("Failed to update user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* DISTINCTIVE ADMIN HEADER - Dark Theme */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 shadow-2xl border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black flex items-center gap-3">
                <span className="text-5xl">⚡</span>
                ADMIN CONTROL PANEL
              </h1>
              <p className="text-yellow-200 mt-2 font-semibold">
                You have FULL platform control
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold transition border border-white/30"
              >
                👁️ View Site
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Logout from admin panel?")) {
                    logout();
                    navigate("/");
                  }
                }}
                className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-bold transition"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: "overview", label: "📊 Overview", color: "blue" },
              { id: "businesses", label: "🏪 Businesses", color: "green" },
              { id: "products", label: "📦 Products", color: "purple" },
              { id: "users", label: "👥 Users", color: "orange" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-bold transition ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-yellow-400 border-b-4 border-yellow-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl shadow-2xl">
                <div className="text-6xl mb-3">🏪</div>
                <div className="text-5xl font-black">
                  {stats.totalBusinesses}
                </div>
                <div className="text-blue-200 text-lg font-semibold mt-2">
                  Total Businesses
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 rounded-2xl shadow-2xl">
                <div className="text-6xl mb-3">📦</div>
                <div className="text-5xl font-black">{stats.totalProducts}</div>
                <div className="text-green-200 text-lg font-semibold mt-2">
                  Total Products
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 rounded-2xl shadow-2xl">
                <div className="text-6xl mb-3">👥</div>
                <div className="text-5xl font-black">{stats.totalUsers}</div>
                <div className="text-purple-200 text-lg font-semibold mt-2">
                  Total Users
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-yellow-400">
                📊 Businesses by Category
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.businessesByCategory.map((cat) => (
                  <div key={cat._id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-green-400">
                      {cat.count}
                    </div>
                    <div className="text-gray-300 mt-1">
                      {cat._id || "Other"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BUSINESSES TAB */}
        {activeTab === "businesses" && (
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-gray-900 border-b border-gray-700">
              <h2 className="text-3xl font-bold text-yellow-400">
                🏪 All Businesses ({businesses.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="p-4 font-bold">Business</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Location</th>
                    <th className="p-4 font-bold">Contact</th>
                    <th className="p-4 font-bold">Featured</th>
                    <th className="p-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((biz) => (
                    <tr
                      key={biz._id}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {biz.logo && (
                            <img
                              src={biz.logo}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          )}
                          <span className="font-semibold">{biz.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{biz.category}</td>
                      <td className="p-4 text-gray-300">{biz.location}</td>
                      <td className="p-4 text-gray-300">{biz.contact}</td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleFeatured(biz._id, biz.featured)}
                          className={`px-4 py-2 rounded-lg font-bold ${
                            biz.featured
                              ? "bg-yellow-500 text-gray-900"
                              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                          }`}
                        >
                          {biz.featured ? "⭐ Featured" : "Not Featured"}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/${biz._id}`)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => deleteBusiness(biz._id, biz.name)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-yellow-400">
                📦 All Products ({products.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-xl"
                >
                  <div className="h-48 bg-gray-700">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-xl mb-2 truncate">
                      {product.name}
                    </h3>
                    <p className="text-green-400 font-bold text-2xl mb-2">
                      ₦{product.price?.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <button
                      onClick={() => deleteProduct(product._id, product.name)}
                      className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
                    >
                      🗑️ Delete Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-gray-900 border-b border-gray-700">
              <h2 className="text-3xl font-bold text-yellow-400">
                👥 All Users ({users.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold">Business</th>
                    <th className="p-4 font-bold">Role</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Joined</th>
                    <th className="p-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="p-4 font-semibold">{u.email}</td>
                      <td className="p-4 text-gray-300">
                        {u.businessId?.name || "No business"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            u.role === "admin"
                              ? "bg-red-500 text-white"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          {u.role === "admin" ? "⚡ ADMIN" : "👤 OWNER"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-bold ${
                            u.banned ? "text-red-400" : "text-green-400"
                          }`}
                        >
                          {u.banned ? "🚫 BANNED" : "✅ Active"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {u.role !== "admin" && (
                          <button
                            onClick={() =>
                              toggleUserBan(u._id, u.banned, u.email)
                            }
                            className={`px-4 py-2 rounded-lg font-bold ${
                              u.banned
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            {u.banned ? "✅ Unban" : "🚫 Ban"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
