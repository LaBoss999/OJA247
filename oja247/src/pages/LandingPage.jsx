import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Menu,
  X,
  Rocket,
  Store,
  Bike,
  Package,
  Search,
  TrendingUp,
  MapPin,
  Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAllBusinesses, getAllProducts } from "../services/api";
import axiosInstance from "../services/api";
import Logo from "../assets/OJA247 VX1.png";
import Logo1 from "../assets/OJA247..PNG";

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [businesses, setBusinesses] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    businesses: 0,
    products: 0,
    categories: 0,
  });

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all three in parallel: businesses, the true product count, and the featured subset to display
      const [businessRes, allProductsRes, featuredRes] = await Promise.all([
        getAllBusinesses(),
        getAllProducts(),
        axiosInstance.get("/api/products/featured"),
      ]);

      setBusinesses(businessRes.data.slice(0, 8));
      setFeaturedProducts(featuredRes.data.slice(0, 8));

      const categories = new Set(businessRes.data.map((b) => b.category));
      setStats({
        businesses: businessRes.data.length,
        products: allProductsRes.data.length, // real total, not just the featured/capped count
        categories: categories.size,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${searchQuery}`);
    }
  };

  const navItems = ["Home", "Vendors", "Products", "About"];

  const { isAuthenticated, business } = useAuth();

  const categories = [
    { name: "Food", icon: "🍔", color: "from-orange-400 to-red-500" },
    { name: "Fashion", icon: "👗", color: "from-pink-400 to-purple-500" },
    { name: "Tech", icon: "💻", color: "from-blue-400 to-indigo-500" },
    { name: "Beauty", icon: "💄", color: "from-purple-400 to-pink-500" },
    { name: "Fitness", icon: "💪", color: "from-green-400 to-teal-500" },
    { name: "Groceries", icon: "🛒", color: "from-yellow-400 to-orange-500" },
    { name: "Electronics", icon: "📱", color: "from-indigo-400 to-blue-500" },
    { name: "Other", icon: "🏪", color: "from-gray-400 to-gray-600" },
  ];

  const features = [
    {
      icon: Store,
      title: "Local Vendors",
      desc: "Discover amazing local businesses",
    },
    {
      icon: Bike,
      title: "Fast Delivery",
      desc: "Quick riders at your service",
    },
    {
      icon: Package,
      title: "Quality Products",
      desc: "Curated selection of goods",
    },
    { icon: Rocket, title: "24/7 Available", desc: "Shop anytime, anywhere" },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-green-400/10 rounded-full blur-3xl"
          animate={{ x: mousePosition.x / 20, y: mousePosition.y / 20 }}
          transition={{ type: "spring", damping: 30 }}
          style={{ left: "10%", top: "20%" }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
          animate={{ x: -mousePosition.x / 30, y: -mousePosition.y / 30 }}
          transition={{ type: "spring", damping: 30 }}
          style={{ right: "10%", bottom: "20%" }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-orange-400/10 rounded-full blur-3xl"
          animate={{ x: mousePosition.x / 40, y: -mousePosition.y / 40 }}
          transition={{ type: "spring", damping: 30 }}
          style={{ left: "50%", top: "50%" }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-green-400/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * -500, Math.random() * 500],
            x: [null, Math.random() * 100 - 50],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Glassmorphic Navbar */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl"
      >
        <div className="backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-3xl shadow-2xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={Logo}
                alt="OJA247"
                className="w-[78px] object-contain"
              />
            </motion.div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item, i) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  onClick={() =>
                    item === "Home"
                      ? navigate("/")
                      : item === "Vendors"
                        ? navigate("/explore")
                        : item === "Products"
                          ? navigate("/products")
                          : item === "About"
                            ? navigate("/about")
                            : null
                  }
                  className="px-6 py-2.5 text-gray-700 font-medium hover:text-gray-900 transition relative group"
                >
                  {item}
                  <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}

              {/* MERGED PART: Auth Buttons */}
              {isAuthenticated ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => navigate(`/dashboard/${business._id}`)}
                  className="px-6 py-2 bg-green-500 text-white rounded-xl font-semibold shadow-lg hover:bg-green-600 transition"
                >
                  My Dashboard
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:bg-green-700 transition"
                >
                  Login
                </motion.button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-900 backdrop-blur-md bg-gray-100/70 rounded-xl"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-4 backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-3xl shadow-2xl overflow-hidden"
          >
            {navItems.map((item, i) => (
              <motion.button
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="block w-full text-left px-8 py-4 text-gray-700 font-medium hover:bg-green-50 transition"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (item === "Home") navigate("/");
                  if (item === "Vendors") navigate("/explore");
                  if (item === "Products") navigate("/products");
                  if (item === "About") navigate("/about");
                }}
              >
                {item}
              </motion.button>
            ))}

            {/* MERGED AUTH CONTROL (Mobile) */}
            <div className="p-4 border-t border-gray-200 bg-white/80">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate(`/dashboard/${business._id}`)}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-xl font-semibold shadow-lg hover:bg-green-600 transition"
                >
                  My Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:bg-green-700 transition"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <main className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 sm:pt-32 pb-12 sm:pb-20 text-center">
        <motion.div style={{ opacity, scale }} className="relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 backdrop-blur-xl bg-white/70 border border-green-200 rounded-full shadow-lg text-xs sm:text-sm"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-base sm:text-xl"
            >
              🇳🇬
            </motion.span>
            <span className="text-gray-700 font-semibold">
              Proudly Nigerian. Built for Business
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 leading-tight"
          >
            <span className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl text-gray-900">
              Welcome to
            </span>
            <br />
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              className="bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent inline-block"
            >
              OJA247
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-base sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed font-light px-4"
          >
            Support local. Shop small. Grow together.
            <br />
            <span className="text-orange-600 font-semibold">
              Discover {stats.businesses}+ amazing vendors and businesses —
              24/7!
            </span>
          </motion.p>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4"
          >
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center backdrop-blur-xl bg-white/80 border-2 border-gray-200/50 rounded-full shadow-xl overflow-hidden group-hover:border-green-400 transition-colors"
              >
                <Search
                  className="ml-4 sm:ml-6 text-gray-400 group-hover:text-green-500 transition-colors flex-shrink-0"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, businesses..."
                  className="flex-1 px-3 sm:px-6 py-3 sm:py-5 bg-transparent text-gray-900 text-sm sm:text-lg focus:outline-none min-w-0"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="m-1.5 sm:m-2 px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition flex-shrink-0"
                >
                  Search
                </motion.button>
              </motion.div>
            </div>
          </motion.form>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/business-form")}
              className="group relative px-6 sm:px-10 py-3 sm:py-5 overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-transform group-hover:scale-110" />
              <span className="relative z-10 text-white font-bold text-sm sm:text-lg flex items-center gap-2 justify-center">
                <Rocket size={18} className="sm:w-6 sm:h-6" />
                <span className="whitespace-nowrap">
                  Register Your Business
                </span>
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/explore")}
              className="group relative px-6 sm:px-10 py-3 sm:py-5 bg-white border-2 border-orange-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl"
            >
              <span className="relative z-10 text-orange-600 font-bold text-sm sm:text-lg flex items-center gap-2 justify-center">
                <Store size={18} className="sm:w-6 sm:h-6" /> Explore Vendors
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-12 sm:mt-20 grid grid-cols-3 gap-3 sm:gap-8 max-w-3xl w-full px-4"
        >
          {[
            {
              value: stats.businesses,
              label: "Active Businesses",
              color: "from-green-500 to-emerald-500",
            },
            {
              value: stats.products,
              label: "Products Listed",
              color: "from-orange-500 to-yellow-500",
            },
            {
              value: stats.categories,
              label: "Categories",
              color: "from-purple-500 to-pink-500",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10, scale: 1.05 }}
              className="backdrop-blur-xl bg-white/60 border border-gray-200/50 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-lg"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 + i * 0.1, type: "spring" }}
                className={`text-2xl sm:text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1 sm:mb-2`}
              >
                {stat.value}+
              </motion.div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Categories Section */}
      <section className="relative z-10 py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-center mb-12 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
          >
            Shop by Category
          </motion.h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: "spring" }}
                whileHover={{ y: -10, rotate: 5, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(`/explore?category=${cat.name}`)}
                className="relative group"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${cat.color} blur-xl opacity-30 group-hover:opacity-60 transition-opacity rounded-2xl`}
                />
                <div className="relative backdrop-blur-xl bg-white/80 border border-gray-200/50 p-6 rounded-2xl hover:bg-white transition shadow-lg hover:shadow-2xl">
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <div className="font-bold text-sm text-gray-900">
                    {cat.name}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Businesses */}
      {businesses.length > 0 && (
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex justify-between items-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Featured Businesses
              </h2>
              <motion.button
                whileHover={{ x: 10 }}
                onClick={() => navigate("/explore")}
                className="text-green-600 font-bold flex items-center gap-2 hover:gap-4 transition-all"
              >
                View All <TrendingUp />
              </motion.button>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {businesses.map((business, i) => (
                <motion.div
                  key={business._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  onClick={() => navigate(`/business/${business._id}`)}
                  className="group relative cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-yellow-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <div className="relative backdrop-blur-xl bg-white/80 border border-gray-200/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition">
                    <div
                      className="h-32 bg-gradient-to-r from-gray-300 to-gray-400"
                      style={{
                        backgroundImage: business.banner
                          ? `url(${business.banner})`
                          : "",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="p-4 -mt-10">
                      <motion.img
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        src={business.logo || "https://via.placeholder.com/80"}
                        alt={business.name}
                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-3 object-cover"
                      />
                      <h3 className="font-bold text-lg mb-1 truncate">
                        {business.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2 h-10">
                        {business.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-2 py-1 rounded-full">
                          {business.category}
                        </span>
                        <MapPin size={12} />
                        <span className="truncate">{business.location}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Products */}
      {featuredProducts.length > 0 && (
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex justify-between items-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Trending Products
              </h2>
              <motion.button
                whileHover={{ x: 10 }}
                onClick={() => navigate("/products")}
                className="text-green-600 font-bold flex items-center gap-2 hover:gap-4 transition-all"
              >
                View All <TrendingUp />
              </motion.button>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="group relative cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-yellow-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <div className="relative backdrop-blur-xl bg-white/80 border border-gray-200/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition flex flex-col">
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="text-gray-300" size={48} />
                        </div>
                      )}
                      <span
                        className={`absolute top-2 left-2 text-[11px] font-semibold px-2 py-1 rounded-full shadow-sm ${
                          product.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>

                    <div className="p-4">
                      {product.businessId?.name && (
                        <p className="text-xs text-gray-400 mb-1 truncate">
                          {product.businessId.name}
                        </p>
                      )}
                      <h3 className="font-bold text-sm sm:text-lg mb-1 truncate">
                        {product.name}
                      </h3>
                      <span className="text-lg sm:text-2xl font-black text-green-600">
                        ₦{product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="group relative p-8 backdrop-blur-xl bg-white/60 border border-gray-200/50 rounded-3xl hover:bg-white/80 transition-all shadow-lg hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-yellow-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex p-4 bg-gradient-to-br from-green-500 to-yellow-500 rounded-2xl mb-4 shadow-md"
                >
                  <feature.icon className="text-white text-3xl" />
                </motion.div>
                <h3 className="text-gray-900 font-bold text-xl mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Premium Footer */}
<footer className="relative z-10 overflow-hidden bg-gray-950 text-white">

  {/* Glow Effects */}
  <div className="absolute inset-0">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
  </div>


  <div className="relative max-w-7xl mx-auto px-6 py-16">

    {/* Top Footer */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">


      {/* Brand */}
      <div className="lg:col-span-2">

        <div className="flex items-center gap-3 mb-5">
          <img
            src={Logo1}
            alt="OJA247.."
            className="w-20 object-contain"
          />

          <span className="text-4xl font-black bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
            OJA247
          </span>
        </div>


        <p className="text-gray-400 leading-relaxed max-w-sm">
          Nigeria's digital marketplace connecting customers with local
          businesses. Discover products, support entrepreneurs, and grow
          together with OJA247.
        </p>


        <div className="mt-6 flex gap-4">

          {[
            {Icon:Facebook},
            {Icon:Twitter},
            {Icon:Instagram}
          ].map(({Icon},i)=>(

            <motion.a
              key={i}
              whileHover={{
                y:-5,
                scale:1.15
              }}
              href="#"
              className="
              w-11 h-11 rounded-full
              bg-white/10
              backdrop-blur-xl
              border border-white/10
              flex items-center justify-center
              hover:bg-green-500
              transition
              "
            >
              <Icon size={20}/>
            </motion.a>

          ))}

        </div>

      </div>



      {/* Marketplace */}
      <div>

        <h3 className="font-bold text-lg mb-5">
          Marketplace
        </h3>

        <ul className="space-y-3 text-gray-400">

          <li className="hover:text-green-400 cursor-pointer">
            Explore Vendors
          </li>

          <li className="hover:text-green-400 cursor-pointer">
            Shop Products
          </li>

          <li className="hover:text-green-400 cursor-pointer">
            Categories
          </li>

          <li className="hover:text-green-400 cursor-pointer">
            Become a Seller
          </li>

        </ul>

      </div>




      {/* Company */}
      <div>

        <h3 className="font-bold text-lg mb-5">
          Company
        </h3>

        <ul className="space-y-3 text-gray-400">

          <li className="hover:text-green-400 cursor-pointer">
            About OJA247
          </li>

          <li className="hover:text-green-400 cursor-pointer">
            Our Story
          </li>

          <li className="hover:text-green-400 cursor-pointer">
            Careers
          </li>

          <li className="hover:text-green-400 cursor-pointer">
            Contact
          </li>

        </ul>

      </div>




      {/* Support */}
      <div>

        <h3 className="font-bold text-lg mb-5">
          Support
        </h3>


        <ul className="space-y-3 text-gray-400">

          <li className="hover:text-green-400 cursor-pointer">
            Help Center
          </li>

          <li className="hover:text-green-400 cursor-pointer">
            Delivery Information
          </li>

          <li className="hover:text-green-400 cursor-pointer">
            Privacy Policy
          </li>

          <li className="hover:text-green-400 cursor-pointer">
            Terms & Conditions
          </li>

        </ul>

      </div>


    </div>



    {/* Newsletter */}
    <div
      className="
      mt-16
      p-8
      rounded-3xl
      bg-white/5
      border border-white/10
      backdrop-blur-xl
      flex
      flex-col
      md:flex-row
      items-center
      justify-between
      gap-6
      "
    >

      <div>

        <h3 className="text-2xl font-bold">
          Join the OJA247 community 🚀
        </h3>

        <p className="text-gray-400 mt-2">
          Get updates about new vendors, products and offers.
        </p>

      </div>



      <div className="flex w-full md:w-auto">

        <input
          type="email"
          placeholder="Enter your email"
          className="
          px-5
          py-3
          rounded-l-xl
          bg-white/10
          border border-white/10
          outline-none
          text-white
          w-full
          md:w-72
          "
        />


        <button
          className="
          px-6
          py-3
          rounded-r-xl
          bg-gradient-to-r
          from-green-500
          to-emerald-500
          font-bold
          hover:scale-105
          transition
          "
        >
          Subscribe
        </button>


      </div>

    </div>



    {/* Bottom */}
    <div
      className="
      mt-12
      pt-6
      border-t border-white/10
      flex
      flex-col
      md:flex-row
      justify-between
      items-center
      gap-4
      text-sm
      text-gray-500
      "
    >

      <p>
        © {new Date().getFullYear()} 
        <span className="text-green-400 font-bold">
          {" "}OJA247
        </span>
        . Made with ❤️ in Nigeria 🇳🇬
      </p>


      <p>
        Built for Sellers. Made for Buyers.
      </p>


    </div>


  </div>

</footer>
    </div>
  );
};

export default LandingPage;
