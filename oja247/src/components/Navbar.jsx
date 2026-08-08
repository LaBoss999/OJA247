import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/OJA247 VX1.png";

const navItems = ["Home", "Vendors", "Products", "About"];

const routeFor = (item) => {
  switch (item) {
    case "Home":
      return "/";
    case "Vendors":
      return "/explore";
    case "Products":
      return "/products";
    case "About":
      return "/about";
    default:
      return "/";
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, business } = useAuth();

  return (
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
            <img src={Logo} alt="OJA247" className="w-[78px] object-contain" />
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
                onClick={() => navigate(routeFor(item))}
                className="px-6 py-2.5 text-gray-700 font-medium hover:text-gray-900 transition relative group"
              >
                {item}
                <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}

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
                navigate(routeFor(item));
              }}
            >
              {item}
            </motion.button>
          ))}

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
  );
};

export default Navbar;
