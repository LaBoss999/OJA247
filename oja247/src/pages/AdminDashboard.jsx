import React, { useState, useEffect } from "react";
import axiosInstance from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import useMinimumLoadingTime from "../hooks/useMinimumLoadingTime";
import {
  Users,
  Store,
  Package,
  TrendingUp,
  Star,
  Trash2,
  Ban,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    businessesByCategory: [],
  });
  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const showLoader = useMinimumLoadingTime(loading);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    try {
      const [statsRes, bizRes, userRes, prodRes, ordersRes] = await Promise.all([
        axiosInstance.get("/api/admin/stats"),
        axiosInstance.get("/api/businesses"),
        axiosInstance.get("/api/admin/users"),
        axiosInstance.get("/api/products/search"),
        axiosInstance.get("/api/admin/orders"),
      ]);

      setStats(statsRes.data);
      setBusinesses(bizRes.data);
      setUsers(userRes.data);
      setProducts(prodRes.data);
      setOrders(ordersRes.data);
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
      await axiosInstance.patch(`/api/admin/businesses/${id}/featured`, {
        featured: !currentStatus,
      });
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
      await axiosInstance.delete(`/api/admin/businesses/${id}`);
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
      await axiosInstance.delete(`/api/products/${id}`);
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
      await axiosInstance.patch(`/api/admin/users/${id}/ban`, {
        banned: !currentStatus,
      });
      alert(`User ${currentStatus ? "unbanned" : "banned"} successfully`);
      fetchAllData();
    } catch (error) {
      alert("Failed to update user status");
    }
  };

  const filteredOrders =
    orderStatusFilter === "all"
      ? orders
      : orders.filter((order) => order.paymentStatus === orderStatusFilter);

  if (showLoader) {
    return <Loader text="Loading Admin Dashboard..." />;
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
              { id: "orders", label: "Orders", icon: ShoppingCart },
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Businesses
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stats.totalBusinesses}
                    </p>
                  </div>
                  <Store className="text-green-600" size={40} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Products
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stats.totalProducts}
                    </p>
                  </div>
                  <Package className="text-yellow-500" size={40} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Users
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stats.totalUsers}
                    </p>
                  </div>
                  <Users className="text-emerald-500" size={40} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Orders
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stats.totalOrders}
                    </p>
                  </div>
                  <ShoppingCart className="text-yellow-500" size={40} />
                </div>
              </div>
            </div>

            <div className="mb-8 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-2">Revenue</h2>
              <p className="text-3xl font-bold text-green-600">
                ₦{Number(stats.totalRevenue || 0).toLocaleString()}
              </p>
            </div>

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

        {activeTab === "orders" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-bold">Recent Orders ({filteredOrders.length})</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "All" },
                  { value: "paid", label: "Paid" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Failed" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setOrderStatusFilter(filter.value)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition border ${
                      orderStatusFilter === filter.value
                        ? "bg-green-600 border-green-600 text-white shadow-sm"
                        : "bg-white border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Reference</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Customer</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Items</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Total</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Payment</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-sm">{order.reference}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{order.customer?.fullName}</p>
                          <p className="text-sm text-gray-500">{order.customer?.email}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{order.items?.length || 0}</td>
                      <td className="p-4 font-semibold text-gray-900">₦{Number(order.total || 0).toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : order.paymentStatus === "failed"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${
                            biz.featured
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
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
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
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
                      className="w-full px-4 py-2 bg-yellow-400 text-yellow-900 rounded hover:bg-yellow-500 flex items-center justify-center gap-2 font-medium"
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