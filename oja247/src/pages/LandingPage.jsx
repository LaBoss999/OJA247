import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Facebook, Twitter, Instagram, Menu, X, Rocket, Store, Bike, Package, Search, TrendingUp, MapPin, Star } from "lucide-react";
import axios from "axios";
import Logo from "../assets/OJA247 VX1.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [businesses, setBusinesses] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ businesses: 0, products: 0, categories: 0 });
  
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
      const businessRes = await axios.get('http://localhost:5000/api/businesses');
      setBusinesses(businessRes.data.slice(0, 8));

      const productsRes = await axios.get('http://localhost:5000/api/products/featured');
      setFeaturedProducts(productsRes.data.slice(0, 8));

      const categories = new Set(businessRes.data.map(b => b.category));
      setStats({
        businesses: businessRes.data.length,
        products: productsRes.data.length,
        categories: categories.size
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${searchQuery}`);
    }
  };

  const navItems = ["Home", "Vendors", "Products", "About"];

  const categories = [
    { name: 'Food', icon: '🍔', color: 'from-orange-400 to-red-500' },
    { name: 'Fashion', icon: '👗', color: 'from-pink-400 to-purple-500' },
    { name: 'Tech', icon: '💻', color: 'from-blue-400 to-indigo-500' },
    { name: 'Beauty', icon: '💄', color: 'from-purple-400 to-pink-500' },
    { name: 'Fitness', icon: '💪', color: 'from-green-400 to-teal-500' },
    { name: 'Groceries', icon: '🛒', color: 'from-yellow-400 to-orange-500' },
    { name: 'Electronics', icon: '📱', color: 'from-indigo-400 to-blue-500' },
    { name: 'Other', icon: '🏪', color: 'from-gray-400 to-gray-600' }
  ];

  const features = [
    { icon: Store, title: "Local Vendors", desc: "Discover amazing local businesses" },
    { icon: Bike, title: "Fast Delivery", desc: "Quick riders at your service" },
    { icon: Package, title: "Quality Products", desc: "Curated selection of goods" },
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
          initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
          animate={{
            y: [null, Math.random() * -500, Math.random() * 500],
            x: [null, Math.random() * 100 - 50],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear" }}
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
            <motion.div whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }}>
              <img src={Logo} alt="OJA247" className="w-[78px] object-contain" />
            </motion.div>

            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item, i) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  onClick={() => item === "Home" ? navigate("/") : item === "Vendors" ? navigate("/explore") : null}
                  className="px-6 py-2.5 text-gray-700 font-medium hover:text-gray-900 transition relative group"
                >
                  {item}
                  <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </nav>

            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-900 backdrop-blur-md bg-gray-100/70 rounded-xl"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

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
                onClick={() => { setMobileMenuOpen(false); item === "Vendors" && navigate("/explore"); }}
              >
                {item}
              </motion.button>
            ))}
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <main className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        <motion.div style={{ opacity, scale }} className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-6 py-3 mb-8 backdrop-blur-xl bg-white/70 border border-green-200 rounded-full shadow-lg"
          >
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              🇳🇬
            </motion.span>
            <span className="text-gray-700 font-semibold">Made in Nigeria with Love</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-8xl font-black mb-6 leading-tight"
          >
            <span className="text-5xl sm:text-8xl text-gray-900">Welcome to</span>
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
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Support local. Shop small. Grow together.
            <br />
            <span className="text-orange-600 font-semibold">
              Discover {stats.businesses}+ amazing vendors and businesses — 24/7!
            </span>
          </motion.p>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center backdrop-blur-xl bg-white/80 border-2 border-gray-200/50 rounded-full shadow-xl overflow-hidden group-hover:border-green-400 transition-colors"
              >
                <Search className="ml-6 text-gray-400 group-hover:text-green-500 transition-colors" size={24} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, businesses..."
                  className="flex-1 px-6 py-5 bg-transparent text-gray-900 text-lg focus:outline-none"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="m-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition"
                >
                  Search
                </motion.button>
              </motion.div>
            </div>
          </motion.form>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/business-form")}
              className="group relative px-10 py-5 overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-transform group-hover:scale-110" />
              <span className="relative z-10 text-white font-bold text-lg flex items-center gap-2 justify-center">
                <Rocket /> Register Your Business
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/explore")}
              className="group relative px-10 py-5 bg-white border-2 border-orange-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl"
            >
              <span className="relative z-10 text-orange-600 font-bold text-lg flex items-center gap-2 justify-center">
                <Store /> Explore Vendors
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-3xl w-full"
        >
          {[
            { value: stats.businesses, label: "Active Businesses", color: "from-green-500 to-emerald-500" },
            { value: stats.products, label: "Products Listed", color: "from-orange-500 to-yellow-500" },
            { value: stats.categories, label: "Categories", color: "from-purple-500 to-pink-500" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10, scale: 1.05 }}
              className="backdrop-blur-xl bg-white/60 border border-gray-200/50 rounded-3xl p-6 shadow-lg"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 + i * 0.1, type: "spring" }}
                className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
              >
                {stat.value}+
              </motion.div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
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
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} blur-xl opacity-30 group-hover:opacity-60 transition-opacity rounded-2xl`} />
                <div className="relative backdrop-blur-xl bg-white/80 border border-gray-200/50 p-6 rounded-2xl hover:bg-white transition shadow-lg hover:shadow-2xl">
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <div className="font-bold text-sm text-gray-900">{cat.name}</div>
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
                        backgroundImage: business.banner ? `url(${business.banner})` : '',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    <div className="p-4 -mt-10">
                      <motion.img
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        src={business.logo || 'https://via.placeholder.com/80'}
                        alt={business.name}
                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-3 object-cover"
                      />
                      <h3 className="font-bold text-lg mb-1 truncate">{business.name}</h3>
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
                <h3 className="text-gray-900 font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full py-12 backdrop-blur-xl bg-gray-900/95 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-sm text-gray-400">
            © {new Date().getFullYear()}{" "}
            <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent font-bold">
              OJA247
            </span>
            . Made with ❤ in Nigeria
          </motion.p>

          <div className="flex gap-6">
            {[
              { Icon: Facebook, label: "Facebook", color: "from-blue-500 to-blue-600" },
              { Icon: Twitter, label: "Twitter", color: "from-sky-400 to-sky-500" },
              { Icon: Instagram, label: "Instagram", color: "from-yellow-500 to-orange-500" },
            ].map(({ Icon, label, color }) => (
              <motion.a
                key={label}
                href="#"
                whileHover={{ scale: 1.3, rotate: 10, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${color} blur-lg opacity-0 group-hover:opacity-60 transition-opacity rounded-full`} />
                <div className="relative p-3 backdrop-blur-xl bg-gray-800/80 border border-gray-700 rounded-full hover:bg-gray-700/80 transition">
                  <Icon className="text-white" size={20} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;