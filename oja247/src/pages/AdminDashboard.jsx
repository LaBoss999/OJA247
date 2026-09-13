import React, { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
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
  Search,
  AlertTriangle,
  BarChart3,
  Award,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "businesses", label: "Businesses", icon: Store },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
  { id: "vendors", label: "Vendor Verification", icon: ShieldCheck },
];

// Small, reusable empty-state block so every table has somewhere
// sensible to land when there's nothing (or no matches) to show.
const EmptyState = ({ icon: Icon, title, message }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 mb-4">
      <Icon size={22} className="text-gray-500" />
    </div>
    <p className="font-semibold text-gray-900 mb-1">{title}</p>
    <p className="text-sm text-gray-500 max-w-xs">{message}</p>
  </div>
);

// Lightweight search field shared across the table headers.
const SearchField = ({ value, onChange, placeholder }) => (
  <div className="relative w-full sm:w-64">
    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-400/40 focus:bg-gray-100 transition"
    />
  </div>
);

// "2026-09-05" -> "Sep 5", for compact chart x-axis labels
const formatChartDate = (isoDate) => {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

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
  const [settings, setSettings] = useState({ enforceSubscriptionVisibility: false });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search terms, one per searchable tab.
  const [businessSearch, setBusinessSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Toast replaces alert() for non-blocking confirmations/errors.
  const [toast, setToast] = useState(null); // { message, type: "success" | "error" }

  // Top bar hides on scroll-down, reappears on scroll-up — same behavior
  // as the public Navbar.jsx, applied here to the admin top bar only (the
  // sidebar stays put; collapsing that too would hide the tab navigation).
  const [topBarHidden, setTopBarHidden] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    const diff = latest - previous;

    if (latest < 80) {
      setTopBarHidden(false);
      return;
    }
    if (Math.abs(diff) < 4) return;

    setTopBarHidden(diff > 0); // true = scrolling down, false = scrolling up
  });

  const showLoader = useMinimumLoadingTime(loading);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = "success") => setToast({ message, type });

  const handleToggleSubscriptionVisibility = async () => {
    const next = !settings.enforceSubscriptionVisibility;
    setSettingsSaving(true);
    try {
      const res = await axiosInstance.patch("/api/admin/settings/subscription-visibility", {
        enabled: next,
      });
      setSettings(res.data);
      showToast(
        next
          ? "Subscription visibility gate turned ON — unsubscribed businesses are now hidden from public listings."
          : "Subscription visibility gate turned OFF — all businesses are visible regardless of subscription status.",
        "success"
      );
      fetchAllData(); // businesses list changes shape immediately when this flips
    } catch (error) {
      showToast(error.response?.data?.message || "Could not update the setting.", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchAllData();
  }, [user]);

  useEffect(() => {
    if (activeTab !== "analytics" || analytics) return; // only fetch once, on first visit to the tab
    setAnalyticsLoading(true);
    Promise.all([
      axiosInstance.get("/api/admin/analytics/growth"),
      axiosInstance.get("/api/admin/analytics/subscriptions"),
      axiosInstance.get("/api/admin/analytics/marketer-leaderboard"),
      axiosInstance.get("/api/admin/analytics/recent-activity"),
    ])
      .then(([growthRes, subsRes, leaderboardRes, activityRes]) => {
        setAnalytics({
          growth: growthRes.data,
          subscriptions: subsRes.data,
          leaderboard: leaderboardRes.data.leaderboard,
          activity: activityRes.data.events,
        });
      })
      .catch(() => showToast("Couldn't load analytics. Try switching tabs and back.", "error"))
      .finally(() => setAnalyticsLoading(false));
  }, [activeTab]);

  const fetchAllData = async () => {
    try {
      const [statsRes, bizRes, userRes, prodRes, ordersRes, vendorsRes, settingsRes] = await Promise.all([
        axiosInstance.get("/api/admin/stats"),
        axiosInstance.get("/api/businesses"),
        axiosInstance.get("/api/admin/users"),
        axiosInstance.get("/api/products/search"),
        axiosInstance.get("/api/admin/orders"),
        axiosInstance.get("/api/admin/vendors"),
        axiosInstance.get("/api/admin/settings"),
      ]);

      setStats(statsRes.data);
      setBusinesses(bizRes.data);
      setUsers(userRes.data);
      setProducts(prodRes.data);
      setOrders(ordersRes.data);
      setVendors(vendorsRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 403) {
        alert("Admin access required");
        navigate("/");
      } else {
        showToast("Couldn't load dashboard data. Try refreshing.", "error");
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
      showToast(currentStatus ? "Removed from featured" : "Marked as featured");
      fetchAllData();
    } catch (error) {
      showToast("Failed to update featured status", "error");
    }
  };

  const setVerificationDeadline = async (id, deadline) => {
    try {
      await axiosInstance.patch(`/api/admin/businesses/${id}/verification-deadline`, { deadline });
      fetchAllData();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update verification deadline", "error");
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
      showToast("Business deleted");
      fetchAllData();
    } catch (error) {
      showToast("Failed to delete business", "error");
    }
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/products/${id}`);
      showToast("Product deleted");
      fetchAllData();
    } catch (error) {
      showToast("Failed to delete product", "error");
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
      showToast(`User ${currentStatus ? "unbanned" : "banned"}`);
      fetchAllData();
    } catch (error) {
      showToast("Failed to update user status", "error");
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
      showToast(`Vendor ${decision}`);
      fetchAllData();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update vendor review status", "error");
    }
  };

  const filteredOrders = orders
    .filter((order) => orderStatusFilter === "all" || order.paymentStatus === orderStatusFilter)
    .filter((order) => {
      if (!orderSearch) return true;
      const q = orderSearch.toLowerCase();
      return (
        order.reference?.toLowerCase().includes(q) ||
        order.customer?.fullName?.toLowerCase().includes(q) ||
        order.customer?.email?.toLowerCase().includes(q)
      );
    });

  const filteredBusinesses = businesses.filter((biz) => {
    if (!businessSearch) return true;
    const q = businessSearch.toLowerCase();
    return biz.name?.toLowerCase().includes(q) || biz.category?.toLowerCase().includes(q) || biz.location?.toLowerCase().includes(q);
  });

  const filteredProducts = products.filter((product) => {
    if (!productSearch) return true;
    return product.name?.toLowerCase().includes(productSearch.toLowerCase());
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return u.email?.toLowerCase().includes(q) || u.businessId?.name?.toLowerCase().includes(q);
  });

  if (showLoader) {
    return <Loader text="Loading Admin Dashboard..." />;
  }

  const activeLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label || "";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative overflow-x-hidden lg:flex">
      {/* Ambient glow orbs — purely decorative, never intercepts clicks */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
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

      {/*
        Sidebar: an overlay drawer on mobile (fixed), but a normal flex
        item that's "sticky" from lg upward — not "fixed" full-height.
        A sticky element releases at the bottom of ITS OWN parent, so
        once this component ends and any page footer begins below it,
        the sidebar stops scrolling and gets out of the footer's way
        instead of permanently floating over it.
      */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 z-50 flex flex-col transform transition-transform duration-300
        lg:sticky lg:translate-x-0 lg:z-30 lg:shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-green-700 font-semibold">
              OJA247
            </p>
            <h1 className="text-xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Control Room
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
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
                    ? "bg-green-50 text-green-800 border border-green-200 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
                }`}
              >
                <tab.icon size={18} className={isActive ? "text-green-700" : ""} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-6 border-t border-gray-200 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition"
          >
            <ExternalLink size={16} />
            View Site
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 relative z-10">
        {/* Top bar */}
        <motion.div
          animate={topBarHidden ? { y: "-100%", opacity: 0 } : { y: "0%", opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-200"
        >
          <div className="flex items-center gap-4 px-4 sm:px-8 py-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
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
              <h2 className="text-2xl font-bold text-gray-900 mt-0.5">{activeLabel}</h2>
            </div>
          </div>
        </motion.div>

        <div className="px-4 sm:px-8 py-8 max-w-7xl">
          {activeTab === "overview" && (
            <div>
              {/* Platform Settings — subscription visibility kill switch */}
              <div
                className={`mb-8 relative rounded-2xl p-6 sm:p-8 border overflow-hidden ${
                  settings.enforceSubscriptionVisibility
                    ? "bg-gray-50 border-gray-200"
                    : "bg-amber-500/10 border-amber-500/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={settings.enforceSubscriptionVisibility ? "text-gray-500" : "text-amber-600"}
                      size={22}
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">Subscription Visibility Gate</h3>
                      <p className="text-sm text-gray-500 mt-1 max-w-xl">
                        When ON, businesses without a currently active subscription are hidden from
                        public listings. Currently{" "}
                        <span className={settings.enforceSubscriptionVisibility ? "text-green-700 font-semibold" : "text-amber-600 font-semibold"}>
                          {settings.enforceSubscriptionVisibility ? "ON" : "OFF"}
                        </span>
                        {!settings.enforceSubscriptionVisibility &&
                          " — all businesses are showing regardless of subscription status."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleSubscriptionVisibility}
                    disabled={settingsSaving}
                    className={`shrink-0 relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-50 ${
                      settings.enforceSubscriptionVisibility ? "bg-green-500" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.enforceSubscriptionVisibility ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

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
                    className="relative bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6 overflow-hidden group hover:border-white/20 transition-colors"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.accent}`} />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-500 text-xs sm:text-sm font-medium">{card.label}</p>
                        <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{card.value}</p>
                      </div>
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.accent} bg-opacity-10 shrink-0`}>
                        <card.icon className="text-gray-900/90" size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue */}
              <div className="mb-8 relative bg-white border border-gray-200 shadow-sm rounded-2xl p-6 sm:p-8 overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
                <h2 className="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-2">
                  Total Revenue
                </h2>
                <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                  ₦{Number(stats.totalRevenue || 0).toLocaleString()}
                </p>
              </div>

              {/* Categories */}
              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Businesses by Category</h2>
                {stats.businessesByCategory.length === 0 ? (
                  <EmptyState icon={Store} title="No categories yet" message="Category breakdowns will show up here as businesses join." />
                ) : (
                  <div className="space-y-3">
                    {stats.businessesByCategory.map((cat) => (
                      <div
                        key={cat._id}
                        className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                      >
                        <span className="font-medium text-gray-600">
                          {cat._id || "Uncategorized"}
                        </span>
                        <span className="px-3 py-1 bg-green-500/15 text-green-700 border border-green-500/30 rounded-full font-semibold text-sm">
                          {cat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex flex-col gap-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Orders <span className="text-gray-500 font-normal">({filteredOrders.length})</span>
                  </h2>
                  <SearchField value={orderSearch} onChange={setOrderSearch} placeholder="Search by reference or customer" />
                </div>
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
                          ? "bg-green-500 border-green-500 text-gray-900 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
              {filteredOrders.length === 0 ? (
                <EmptyState
                  icon={ShoppingCart}
                  title={orderSearch || orderStatusFilter !== "all" ? "No matching orders" : "No orders yet"}
                  message={orderSearch || orderStatusFilter !== "all" ? "Try a different search or filter." : "Orders will appear here as customers check out."}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Reference</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Customer</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Items</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Total</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Payment</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-sm text-gray-600">{order.reference}</td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-gray-900">{order.customer?.fullName}</p>
                              <p className="text-sm text-gray-500">{order.customer?.email}</p>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-500">{order.items?.length || 0}</td>
                          <td className="p-4 font-semibold text-gray-900">₦{Number(order.total || 0).toLocaleString()}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                order.paymentStatus === "paid"
                                  ? "bg-green-500/15 text-green-700 border-green-500/30"
                                  : order.paymentStatus === "failed"
                                  ? "bg-red-500/15 text-red-600 border-red-500/30"
                                  : "bg-yellow-500/15 text-amber-700 border-yellow-500/30"
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
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              {analyticsLoading && !analytics && (
                <div className="flex items-center justify-center py-24">
                  <p className="text-gray-500 text-sm">Loading analytics...</p>
                </div>
              )}

              {analytics && (
                <div className="space-y-8">
                  {/* Trend charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[
                      { key: "userGrowth", title: "Users Onboarded", color: "#16a34a", type: "line" },
                      { key: "businessGrowth", title: "Businesses Onboarded", color: "#0ea5e9", type: "line" },
                      { key: "revenueGrowth", title: "Revenue", color: "#eab308", type: "bar", isCurrency: true },
                      { key: "conversionGrowth", title: "Referral Conversions", color: "#a855f7", type: "bar" },
                    ].map((chart) => {
                      const data = (analytics.growth[chart.key] || []).map((d) => ({
                        ...d,
                        label: formatChartDate(d.date),
                      }));
                      const total = data.reduce((sum, d) => sum + d.count, 0);
                      return (
                        <div
                          key={chart.key}
                          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6"
                        >
                          <div className="flex items-baseline justify-between mb-4">
                            <h3 className="font-bold text-gray-900">{chart.title}</h3>
                            <p className="text-sm text-gray-500">
                              {chart.isCurrency ? `₦${total.toLocaleString()}` : total.toLocaleString()}{" "}
                              <span className="text-gray-400">last {analytics.growth.days} days</span>
                            </p>
                          </div>
                          <ResponsiveContainer width="100%" height={220}>
                            {chart.type === "line" ? (
                              <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis
                                  dataKey="label"
                                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                                  interval="preserveStartEnd"
                                />
                                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                                <Tooltip />
                                <Line
                                  type="monotone"
                                  dataKey="count"
                                  stroke={chart.color}
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            ) : (
                              <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis
                                  dataKey="label"
                                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                                  interval="preserveStartEnd"
                                />
                                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                                <Tooltip
                                  formatter={(value) =>
                                    chart.isCurrency ? `₦${Number(value).toLocaleString()}` : value
                                  }
                                />
                                <Bar dataKey="count" fill={chart.color} radius={[4, 4, 0, 0]} />
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subscription status breakdown */}
                  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Subscription Status</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: "Active", value: analytics.subscriptions.active, color: "text-green-700 bg-green-50 border-green-200" },
                        { label: "Expired", value: analytics.subscriptions.expired, color: "text-red-600 bg-red-50 border-red-200" },
                        { label: "Never Subscribed", value: analytics.subscriptions.neverSubscribed, color: "text-gray-600 bg-gray-50 border-gray-200" },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{s.label}</p>
                          <p className="text-2xl font-black mt-1">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Marketer leaderboard */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                      <div className="p-6 border-b border-gray-200 flex items-center gap-2">
                        <Award size={18} className="text-amber-600" />
                        <h3 className="font-bold text-gray-900">Top Marketers</h3>
                      </div>
                      {analytics.leaderboard.length === 0 ? (
                        <EmptyState icon={Award} title="No payouts yet" message="Marketer earnings will show up here once referrals start converting." />
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {analytics.leaderboard.map((m, i) => (
                            <div key={m.marketerId} className="flex items-center justify-between px-6 py-3">
                              <div className="flex items-center gap-3">
                                <span className="w-6 text-center text-sm font-bold text-gray-400">{i + 1}</span>
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {m.referralCode} · {m.totalReferred} referred · {m.totalConversions} converted
                                  </p>
                                </div>
                              </div>
                              <p className="font-bold text-green-700 text-sm">₦{m.totalEarned.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recent activity */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                      <div className="p-6 border-b border-gray-200 flex items-center gap-2">
                        <Clock size={18} className="text-gray-500" />
                        <h3 className="font-bold text-gray-900">Recent Activity</h3>
                      </div>
                      {analytics.activity.length === 0 ? (
                        <EmptyState icon={Clock} title="Nothing yet" message="Signups and orders will show up here as they happen." />
                      ) : (
                        <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
                          {analytics.activity.map((event, i) => (
                            <div key={i} className="px-6 py-3 flex items-start justify-between gap-3">
                              <p className="text-sm text-gray-700">{event.label}</p>
                              <p className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                                {new Date(event.timestamp).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "businesses" && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  All Businesses <span className="text-gray-500 font-normal">({filteredBusinesses.length})</span>
                </h2>
                <SearchField value={businessSearch} onChange={setBusinessSearch} placeholder="Search by name, category, or location" />
              </div>
              {filteredBusinesses.length === 0 ? (
                <EmptyState
                  icon={Store}
                  title={businessSearch ? "No matching businesses" : "No businesses yet"}
                  message={businessSearch ? `Nothing matches "${businessSearch}".` : "Businesses will appear here once vendors sign up."}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Business</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Category</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Location</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Contact</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Featured</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Verification Deadline</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBusinesses.map((biz) => (
                        <tr key={biz._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {biz.logo && (
                                <img
                                  src={biz.logo}
                                  alt=""
                                  className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                />
                              )}
                              <span className="font-medium text-gray-900">{biz.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-500">{biz.category}</td>
                          <td className="p-4 text-gray-500">{biz.location}</td>
                          <td className="p-4 text-gray-500">{biz.contact}</td>
                          <td className="p-4">
                            <button
                              onClick={() => toggleFeatured(biz._id, biz.featured)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border transition ${
                                biz.featured
                                  ? "bg-yellow-500/15 text-amber-700 border-yellow-500/30"
                                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              <Star size={14} fill={biz.featured ? "currentColor" : "none"} />
                              {biz.featured ? "Featured" : "Not Featured"}
                            </button>
                          </td>
                          <td className="p-4">
                            <p className="text-xs text-gray-500 mb-1.5">
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
                                  className="px-2.5 py-1 bg-green-500/15 text-green-700 border border-green-500/30 rounded-lg hover:bg-green-500/25 text-xs font-medium transition"
                                >
                                  Start 30-day countdown
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => extendVerificationDeadline(biz, 7)}
                                    className="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 text-xs font-medium transition"
                                  >
                                    +7 days
                                  </button>
                                  <button
                                    onClick={() => clearVerificationDeadline(biz)}
                                    className="px-2.5 py-1 bg-red-500/15 text-red-600 border border-red-500/30 rounded-lg hover:bg-red-500/25 text-xs font-medium transition"
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
                                className="px-3 py-1.5 bg-green-500 text-gray-900 rounded-lg hover:bg-green-600 text-sm font-medium transition"
                              >
                                View
                              </button>
                              <button
                                onClick={() => deleteBusiness(biz._id, biz.name)}
                                className="px-3 py-1.5 bg-red-500/15 text-red-600 border border-red-500/30 rounded-lg hover:bg-red-500/25 text-sm font-medium flex items-center gap-1 transition"
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
              )}
            </div>
          )}

          {activeTab === "products" && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  All Products <span className="text-gray-500 font-normal">({filteredProducts.length})</span>
                </h2>
                <SearchField value={productSearch} onChange={setProductSearch} placeholder="Search products" />
              </div>
              {filteredProducts.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title={productSearch ? "No matching products" : "No products yet"}
                  message={productSearch ? `Nothing matches "${productSearch}".` : "Products will appear here as vendors list them."}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-white/20 hover:-translate-y-0.5 transition-all"
                    >
                      <div className="h-44 bg-gray-50">
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
                        <h3 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                        <p className="text-green-700 font-bold text-lg mb-2">
                          ₦{product.price?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <button
                          onClick={() => deleteProduct(product._id, product.name)}
                          className="w-full px-4 py-2 bg-yellow-500/15 text-amber-700 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/25 flex items-center justify-center gap-2 font-medium text-sm transition"
                        >
                          <Trash2 size={15} />
                          Delete Product
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  All Users <span className="text-gray-500 font-normal">({filteredUsers.length})</span>
                </h2>
                <SearchField value={userSearch} onChange={setUserSearch} placeholder="Search by email or business" />
              </div>
              {filteredUsers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={userSearch ? "No matching users" : "No users yet"}
                  message={userSearch ? `Nothing matches "${userSearch}".` : "Registered users will appear here."}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Email</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Business</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Role</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Joined</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-900">{u.email}</td>
                          <td className="p-4 text-gray-500">{u.businessId?.name || "No business"}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                u.role === "admin"
                                  ? "bg-purple-500/15 text-purple-700 border-purple-500/30"
                                  : "bg-blue-500/15 text-blue-700 border-blue-500/30"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`flex items-center gap-1.5 text-sm font-medium ${
                                u.banned ? "text-red-600" : "text-green-700"
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
                                    ? "bg-green-500/15 text-green-700 border border-green-500/30 hover:bg-green-500/25"
                                    : "bg-red-500/15 text-red-600 border border-red-500/30 hover:bg-red-500/25"
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
              )}
            </div>
          )}

          {activeTab === "vendors" && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Vendor Verification <span className="text-gray-500 font-normal">({vendors.length})</span>
                </h2>
              </div>
              {vendors.length === 0 ? (
                <EmptyState icon={ShieldCheck} title="Nothing to review" message="Vendor verification submissions will show up here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Business</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Tier</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Documents</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Review Status</th>
                        <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map((v) => (
                        <tr key={v._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <p className="font-medium text-gray-900">{v.businessId?.name || v.businessName}</p>
                            <p className="text-sm text-gray-500">{v.contactEmail}</p>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-500/15 text-blue-700 border-blue-500/30 capitalize">
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
                                <span key={doc.label} className="flex items-center gap-1.5 text-gray-500">
                                  <FileText size={13} />
                                  {doc.url ? (
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-green-700 hover:underline"
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
                                  ? "bg-green-500/15 text-green-700 border-green-500/30"
                                  : v.reviewStatus === "rejected"
                                  ? "bg-red-500/15 text-red-600 border-red-500/30"
                                  : "bg-yellow-500/15 text-amber-700 border-yellow-500/30"
                              }`}
                            >
                              {v.reviewStatus}
                            </span>
                            {v.reviewStatus === "rejected" && v.reviewNotes && (
                              <p className="text-xs text-gray-500 mt-1 max-w-[220px]">{v.reviewNotes}</p>
                            )}
                            {v.payoutHold && (
                              <span className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/15 text-orange-700 border border-orange-500/30 w-fit">
                                <AlertTriangle size={11} />
                                Payout on hold
                              </span>
                            )}
                            {v.payoutHold && v.payoutHoldReason && (
                              <p className="text-xs text-orange-700/80 mt-1 max-w-[220px]">{v.payoutHoldReason}</p>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => reviewVendor(v._id, "approved", v.businessId?.name || v.businessName)}
                                className="px-3 py-1.5 bg-green-500/15 text-green-700 border border-green-500/30 rounded-lg hover:bg-green-500/25 text-sm font-medium flex items-center gap-1 transition"
                              >
                                <ShieldCheck size={14} />
                                Approve
                              </button>
                              <button
                                onClick={() => reviewVendor(v._id, "rejected", v.businessId?.name || v.businessName)}
                                className="px-3 py-1.5 bg-red-500/15 text-red-600 border border-red-500/30 rounded-lg hover:bg-red-500/25 text-sm font-medium flex items-center gap-1 transition"
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast — replaces alert() for non-blocking confirmations/errors */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
          }`}
        >
          {toast.type === "error" ? <XCircle size={18} /> : <CheckCircle size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;