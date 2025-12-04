import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Store,
  Package,
  TrendingUp,
  Star,
  Trash2,
  Ban,
  CheckCircle,
} from "lucide-react";

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

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const [statsRes, bizRes, userRes, prodRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/stats", config),
        axios.get("http://localhost:5000/api/businesses", config),
        axios.get("http://localhost:5000/api/admin/users", config),
        axios.get("http://localhost:5000/api/products/search", config),
      ]);

      setStats(statsRes.data);
      setBusinesses(bizRes.data);
      setUsers(userRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 403) {
        alert("Admin access required");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id, currentStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/businesses/${id}/featured`,
        { featured: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllData();
    } catch (error) {
      alert("Failed to update featured status");
    }
  };

  const deleteBusiness = async (id, name) => {
    if (
      !window.confirm(
        `Delete "${name}" and all its products?\n\nThis action cannot be undone!`
      )
    ) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/businesses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Business deleted successfully");
      fetchAllData();
    } catch (error) {
      alert("Failed to delete business");
    }
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Product deleted successfully");
      fetchAllData();
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  const toggleUserBan = async (id, currentStatus, email) => {
    if (
      !window.confirm(`${currentStatus ? "Unban" : "Ban"} user "${email}"?`)
    ) {
      return;
    }

    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${id}/ban`,
        { banned: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`User ${currentStatus ? "unbanned" : "banned"} successfully`);
      fetchAllData();
    } catch (error) {
      alert("Failed to update user status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                🔐 Admin Dashboard
              </h1>
              <p className="text-green-100 mt-1">
                Full platform control & monitoring
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition"
              >
                View Site
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "businesses", label: "Businesses", icon: Store },
              { id: "products", label: "Products", icon: Package },
              { id: "users", label: "Users", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium transition ${
                  activeTab === tab.id
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Businesses
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stats.totalBusinesses}
                    </p>
                  </div>
                  <Store className="text-blue-500" size={40} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Products
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stats.totalProducts}
                    </p>
                  </div>
                  <Package className="text-green-500" size={40} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Users
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stats.totalUsers}
                    </p>
                  </div>
                  <Users className="text-purple-500" size={40} />
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Businesses by Category</h2>
              <div className="space-y-3">
                {stats.businessesByCategory.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-700">
                      {cat._id || "Uncategorized"}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                      {cat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "businesses" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                All Businesses ({businesses.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Business
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Location
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Contact
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Featured
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((biz) => (
                    <tr key={biz._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {biz.logo && (
                            <img
                              src={biz.logo}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <span className="font-medium">{biz.name}</span>
                        </div>
                      </td>
                      <td className="p-4">{biz.category}</td>
                      <td className="p-4">{biz.location}</td>
                      <td className="p-4">{biz.contact}</td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleFeatured(biz._id, biz.featured)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            biz.featured
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <Star
                            size={14}
                            fill={biz.featured ? "currentColor" : "none"}
                          />
                          {biz.featured ? "Featured" : "Not Featured"}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/${biz._id}`)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteBusiness(biz._id, biz.name)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Delete
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

        {activeTab === "products" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                All Products ({products.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  <div className="h-48 bg-gray-200">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="text-gray-400" size={48} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-green-600 font-bold text-xl mb-2">
                      ₦{product.price?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <button
                      onClick={() => deleteProduct(product._id, product.name)}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">All Users ({users.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Business
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Joined
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{u.email}</td>
                      <td className="p-4">
                        {u.businessId?.name || "No business"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`flex items-center gap-1 ${
                            u.banned ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {u.banned ? (
                            <Ban size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                          {u.banned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {u.role !== "admin" && (
                          <button
                            onClick={() =>
                              toggleUserBan(u._id, u.banned, u.email)
                            }
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              u.banned
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                          >
                            {u.banned ? "Unban" : "Ban User"}
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
