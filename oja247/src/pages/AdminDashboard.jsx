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
  Menu,
  X,
  LogOut,
  ExternalLink,
  ShieldCheck,
  XCircle,
  FileText,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "businesses", label: "Businesses", icon: Store },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
  { id: "vendors", label: "Vendor Verification", icon: ShieldCheck },
];

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
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      const [statsRes, bizRes, userRes, prodRes, ordersRes, vendorsRes] = await Promise.all([
        axiosInstance.get("/api/admin/stats"),
        axiosInstance.get("/api/businesses"),
        axiosInstance.get("/api/admin/users"),
        axiosInstance.get("/api/products/search"),
        axiosInstance.get("/api/admin/orders"),
        axiosInstance.get("/api/admin/vendors"),
      ]);

      setStats(statsRes.data);
      setBusinesses(bizRes.data);
      setUsers(userRes.data);
      setProducts(prodRes.data);
      setOrders(ordersRes.data);
      setVendors(vendorsRes.data);
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

  const setVerificationDeadline = async (id, deadline) => {
    try {
      await axiosInstance.patch(`/api/admin/businesses/${id}/verification-deadline`, { deadline });
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update verification deadline");
    }
  };

  const startVerificationCountdown = (biz) => {
    const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    setVerificationDeadline(biz._id, deadline);
  };

  const extendVerificationDeadline = (biz, days) => {
    const base = biz.verificationDeadline ? new Date(biz.verificationDeadline) : new Date();
    const deadline = new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    setVerificationDeadline(biz._id, deadline);
  };

  const clearVerificationDeadline = (biz) => {
    if (!window.confirm(`Stop the verification countdown for "${biz.name}"? Their store will never be auto-hidden until you start it again.`)) {
      return;
    }
    setVerificationDeadline(biz._id, null);
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

  const reviewVendor = async (id, decision, businessName) => {
    let notes = "";

    if (decision === "rejected") {
      const input = window.prompt(`Reason for rejecting ${businessName}'s verification? (shown to the vendor)`);
      if (input === null) return; // cancelled
      notes = input;
    } else if (!window.confirm(`Approve ${businessName}'s vendor verification?`)) {
      return;
    }

    try {
      await axiosInstance.patch(`/api/admin/vendors/${id}/review`, { decision, notes });
      alert(`Vendor ${decision}.`);
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update vendor review status.");
    }
  };

  const filteredOrders =
    orderStatusFilter === "all"
      ? orders
      : orders.filter((order) => order.paymentStatus === orderStatusFilter);

  if (showLoader) {
    return <Loader text="Loading Admin Dashboard..." />;
  }

  const activeLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label || "";

  return (
    <div className="min-h-screen bg-[#05070a] text-white relative overflow-x-hidden">
      {/* Ambient glow orbs — same device as the storefront footer, carried into the admin surface */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 z-50 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-green-400 font-semibold">
              OJA247
            </p>
            <h1 className="text-xl font-black bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
              Control Room
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {NAV_ITEMS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-green-500/20 to-yellow-500/10 text-white border border-green-400/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <tab.icon size={18} className={isActive ? "text-green-400" : ""} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-6 border-t border-white/10 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <ExternalLink size={16} />
            View Site
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72 relative z-10">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-[#05070a]/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-4 px-4 sm:px-8 py-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-gray-300"
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
                  Live
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-0.5">{activeLabel}</h2>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-8 max-w-7xl">
          {activeTab === "overview" && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {[
                  { label: "Total Businesses", value: stats.totalBusinesses, icon: Store, accent: "from-green-500 to-emerald-500" },
                  { label: "Total Products", value: stats.totalProducts, icon: Package, accent: "from-yellow-500 to-amber-500" },
                  { label: "Total Users", value: stats.totalUsers, icon: Users, accent: "from-emerald-500 to-green-400" },
                  { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, accent: "from-yellow-400 to-yellow-600" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 overflow-hidden group hover:border-white/20 transition-colors"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.accent}`} />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm font-medium">{card.label}</p>
                        <p className="text-2xl sm:text-3xl font-black text-white mt-2">{card.value}</p>
                      </div>
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.accent} bg-opacity-10 shrink-0`}>
                        <card.icon className="text-white/90" size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue */}
              <div className="mb-8 relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
                <h2 className="text-sm uppercase tracking-widest text-gray-400 font-semibold mb-2">
                  Total Revenue
                </h2>
                <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
                  ₦{Number(stats.totalRevenue || 0).toLocaleString()}
                </p>
              </div>

              {/* Categories */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-white mb-5">Businesses by Category</h2>
                <div className="space-y-3">
                  {stats.businessesByCategory.map((cat) => (
                    <div
                      key={cat._id}
                      className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5"
                    >
                      <span className="font-medium text-gray-300">
                        {cat._id || "Uncategorized"}
                      </span>
                      <span className="px-3 py-1 bg-green-500/15 text-green-400 border border-green-500/30 rounded-full font-semibold text-sm">
                        {cat.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-white">
                  Recent Orders <span className="text-gray-500 font-normal">({filteredOrders.length})</span>
                </h2>
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
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                        orderStatusFilter === filter.value
                          ? "bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                          : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Reference</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Customer</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Items</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Total</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Payment</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium text-sm text-gray-300">{order.reference}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-white">{order.customer?.fullName}</p>
                            <p className="text-sm text-gray-500">{order.customer?.email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-400">{order.items?.length || 0}</td>
                        <td className="p-4 font-semibold text-white">₦{Number(order.total || 0).toLocaleString()}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              order.paymentStatus === "paid"
                                ? "bg-green-500/15 text-green-400 border-green-500/30"
                                : order.paymentStatus === "failed"
                                ? "bg-red-500/15 text-red-400 border-red-500/30"
                                : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
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
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">
                  All Businesses <span className="text-gray-500 font-normal">({businesses.length})</span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Business</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Category</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Location</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Contact</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Featured</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Verification Deadline</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((biz) => (
                      <tr key={biz._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {biz.logo && (
                              <img
                                src={biz.logo}
                                alt=""
                                className="w-9 h-9 rounded-full object-cover border border-white/10"
                              />
                            )}
                            <span className="font-medium text-white">{biz.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400">{biz.category}</td>
                        <td className="p-4 text-gray-400">{biz.location}</td>
                        <td className="p-4 text-gray-400">{biz.contact}</td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleFeatured(biz._id, biz.featured)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border transition ${
                              biz.featured
                                ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            <Star size={14} fill={biz.featured ? "currentColor" : "none"} />
                            {biz.featured ? "Featured" : "Not Featured"}
                          </button>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-400 mb-1.5">
                            {biz.verificationDeadline
                              ? `${new Date(biz.verificationDeadline) < new Date() ? "Expired" : "Due"} ${new Date(
                                  biz.verificationDeadline
                                ).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`
                              : "Not started"}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {!biz.verificationDeadline ? (
                              <button
                                onClick={() => startVerificationCountdown(biz)}
                                className="px-2.5 py-1 bg-green-500/15 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/25 text-xs font-medium transition"
                              >
                                Start 30-day countdown
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => extendVerificationDeadline(biz, 7)}
                                  className="px-2.5 py-1 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 text-xs font-medium transition"
                                >
                                  +7 days
                                </button>
                                <button
                                  onClick={() => clearVerificationDeadline(biz)}
                                  className="px-2.5 py-1 bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/25 text-xs font-medium transition"
                                >
                                  Clear
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/${biz._id}`)}
                              className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition"
                            >
                              View
                            </button>
                            <button
                              onClick={() => deleteBusiness(biz._id, biz.name)}
                              className="px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/25 text-sm font-medium flex items-center gap-1 transition"
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
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">
                  All Products <span className="text-gray-500 font-normal">({products.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="h-44 bg-white/5">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="text-gray-600" size={40} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white mb-1 truncate">{product.name}</h3>
                      <p className="text-green-400 font-bold text-lg mb-2">
                        ₦{product.price?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <button
                        onClick={() => deleteProduct(product._id, product.name)}
                        className="w-full px-4 py-2 bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/25 flex items-center justify-center gap-2 font-medium text-sm transition"
                      >
                        <Trash2 size={15} />
                        Delete Product
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">
                  All Users <span className="text-gray-500 font-normal">({users.length})</span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Email</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Business</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Role</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Joined</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium text-white">{u.email}</td>
                        <td className="p-4 text-gray-400">{u.businessId?.name || "No business"}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              u.role === "admin"
                                ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                                : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`flex items-center gap-1.5 text-sm font-medium ${
                              u.banned ? "text-red-400" : "text-green-400"
                            }`}
                          >
                            {u.banned ? <Ban size={15} /> : <CheckCircle size={15} />}
                            {u.banned ? "Banned" : "Active"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {u.role !== "admin" && (
                            <button
                              onClick={() => toggleUserBan(u._id, u.banned, u.email)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                u.banned
                                  ? "bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25"
                                  : "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
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

          {activeTab === "vendors" && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">
                  Vendor Verification <span className="text-gray-500 font-normal">({vendors.length})</span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Business</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Tier</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Documents</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Review Status</th>
                      <th className="text-left p-4 font-semibold text-gray-400 text-xs uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((v) => (
                      <tr key={v._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-white">{v.businessId?.name || v.businessName}</p>
                          <p className="text-sm text-gray-500">{v.contactEmail}</p>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-500/15 text-blue-300 border-blue-500/30 capitalize">
                            {v.verificationTier}
                          </span>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="flex flex-col gap-1">
                            {[
                              { label: "NIN", value: v.nin },
                              { label: "CAC", url: v.cacDocumentUrl },
                              { label: "Address proof", url: v.addressProofUrl },
                              { label: "Selfie", url: v.selfieUrl },
                            ].map((doc) => (
                              <span key={doc.label} className="flex items-center gap-1.5 text-gray-400">
                                <FileText size={13} />
                                {doc.url ? (
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-400 hover:underline"
                                  >
                                    {doc.label}
                                  </a>
                                ) : (
                                  <span>{doc.label}: {doc.value || "—"}</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${
                              v.reviewStatus === "approved"
                                ? "bg-green-500/15 text-green-400 border-green-500/30"
                                : v.reviewStatus === "rejected"
                                ? "bg-red-500/15 text-red-400 border-red-500/30"
                                : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                            }`}
                          >
                            {v.reviewStatus}
                          </span>
                          {v.reviewStatus === "rejected" && v.reviewNotes && (
                            <p className="text-xs text-gray-500 mt-1 max-w-[220px]">{v.reviewNotes}</p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => reviewVendor(v._id, "approved", v.businessId?.name || v.businessName)}
                              className="px-3 py-1.5 bg-green-500/15 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/25 text-sm font-medium flex items-center gap-1 transition"
                            >
                              <ShieldCheck size={14} />
                              Approve
                            </button>
                            <button
                              onClick={() => reviewVendor(v._id, "rejected", v.businessId?.name || v.businessName)}
                              className="px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/25 text-sm font-medium flex items-center gap-1 transition"
                            >
                              <XCircle size={14} />
                              Reject
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;