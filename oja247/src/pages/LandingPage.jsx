import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Facebook, Twitter, Instagram, Menu, X, Rocket, Store, Bike, Package } from "lucide-react";
import Logo from "../assets/OJA247 VX1.png"; // adjust path if needed

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Navigation handlers
  const handleRegisterBusiness = () => {
    window.location.href = "/business-form";
  };

  const handleExploreVendors = () => {
    window.location.href = "/businesses";
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const navItems = ["Company", "Vendors", "Riders", "Products"];
  const currentYear = new Date().getFullYear();

  const features = [
    { icon: Store, title: "Local Vendors", desc: "Discover amazing local businesses" },
    { icon: Bike, title: "Fast Delivery", desc: "Quick riders at your service" },
    { icon: Package, title: "Quality Products", desc: "Curated selection of goods" },
    { icon: Rocket, title: "24/7 Available", desc: "Shop anytime, anywhere" },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-green-400/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x / 20,
            y: mousePosition.y / 20,
          }}
          transition={{ type: "spring", damping: 30 }}
          style={{ left: "10%", top: "20%" }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x / 30,
            y: -mousePosition.y / 30,
          }}
          transition={{ type: "spring", damping: 30 }}
          style={{ right: "10%", bottom: "20%" }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-orange-400/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x / 40,
            y: -mousePosition.y / 40,
          }}
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
              className="flex items-center gap-3"
            >
              

              <div className="relative">
                <div></div>

                <div>
                  <img
                    src={Logo}
                    alt="OJA247 Logo"
                    className="w-[84px] object-contain"
                  />
                </div>
              </div>


            </motion.div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item, i) => (
                <motion.a
                  key={item}
                  href="#"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="px-6 py-2.5 text-gray-700 font-medium hover:text-gray-900 transition relative group"
                >
                  {item}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    layoutId="navbar-indicator"
                  />
                </motion.a>
              ))}
            </nav>

            {/* Mobile Menu Toggle */}
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
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mt-4 backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-3xl shadow-2xl overflow-hidden"
          >
            {navItems.map((item, i) => (
              <motion.a
                key={item}
                href="#"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="block px-8 py-4 text-gray-700 font-medium hover:bg-green-50 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </motion.a>
            ))}
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <main className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        <motion.div style={{ opacity, scale }} className="relative z-10">
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-6 py-3 mb-8 backdrop-blur-xl bg-white/70 border border-green-200 rounded-full shadow-lg"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-2xl"
            >
              🇳🇬
            </motion.span>
            <span className="text-gray-700 font-semibold">Made in Nigeria with Love</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-8xl font-black mb-6 leading-tight"
          >
            <span className="text-5xl md:text-8xl text-[#1db954]">
              Welcome to
            </span>
            <br />
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              className="text-[#121212] inline-block"
            >
              OJA<span className="text-[#ffc107]">247</span>
            </motion.span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Support local. Shop small. Grow together.
            <br />
            <span className="text-orange-600 font-semibold">
              Discover amazing vendors and businesses around you — 24/7!
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRegisterBusiness}
              className="group relative px-10 py-5 overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-white font-bold text-lg flex items-center gap-2">
                <Rocket /> Register Your Business
              </span>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExploreVendors}
              className="group relative px-10 py-5 bg-white border-2 border-orange-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-orange-600 font-bold text-lg flex items-center gap-2">
                <Store /> Explore Vendors
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.1 }}
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
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-12 backdrop-blur-xl bg-gray-900/95 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-sm text-gray-400"
          >
            © {currentYear}{" "}
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
                aria-label={label}
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