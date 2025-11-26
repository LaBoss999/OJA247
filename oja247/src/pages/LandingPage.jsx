import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFacebookF, FaTwitter, FaInstagram, FaBars, FaTimes } from "react-icons/fa";
import Logo from "../assets/OJA247.png"; // import your logo

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = ["Company", "Vendors", "Riders", "Products"];
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 shadow-md border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo on the left */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
            <img src={Logo} alt="OJA247 Logo" className="h-12 w-auto" />
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 bg-gray-50/70 backdrop-blur-md px-6 py-3 rounded-full shadow-inner border border-gray-200">
            {navItems.map((item, i) => (
              <motion.a
                key={item}
                href="#"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.1, color: "#FF7A00" }}
                className="px-5 py-2 text-gray-700 font-medium hover:text-[#FF7A00] transition whitespace-nowrap"
              >
                {item}
              </motion.a>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="block px-8 py-4 text-gray-700 font-medium hover:bg-orange-50 hover:text-[#FF7A00]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </motion.div>
        )}
      </motion.header>

      {/* Main Hero Section */}
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center bg-gradient-to-b from-gray-50 to-white">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight"
        >
          Welcome to <span className="text-[#FF7A00]">OJA247</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl text-gray-700 mb-12 max-w-2xl leading-relaxed"
        >
          Support local. Shop small. Grow together. Discover amazing vendors and businesses around you — 24/7!
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: "0 20px 40px rgba(29, 185, 84, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/business-form")}
            className="px-10 py-5 bg-[#1DB954] text-white font-bold text-lg rounded-2xl shadow-xl hover:bg-[#1ed760] transition-all"
          >
            Register Your Business
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08, backgroundColor: "#FF7A00", color: "white" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/businesses")}
            className="px-10 py-5 bg-white text-[#FF7A00] font-bold text-lg rounded-2xl border-4 border-[#FF7A00] shadow-xl transition-all"
          >
            Explore Vendors
          </motion.button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-[#121212] text-gray-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-sm">
            © {currentYear} <span className="text-[#FF7A00] font-bold">OJA247</span>. Made with ❤ in Nigeria
          </p>

          <div className="flex gap-8">
            {[
              { Icon: FaFacebookF, label: "Facebook" },
              { Icon: FaTwitter, label: "Twitter" },
              { Icon: FaInstagram, label: "Instagram" },
            ].map(({ Icon, label }) => (
              <motion.a
                key={label}
                href="#"
                aria-label={`Follow OJA247 on ${label}`}
                whileHover={{ scale: 1.3, color: "#FFC107" }}
                className="text-[#FF7A00]"
              >
                <Icon size={24} />
              </motion.a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
