import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram } from "lucide-react";
import Logo1 from "../assets/OJA247..PNG";

const marketplaceLinks = [
  { label: "Explore Vendors", path: "/explore" },
  { label: "Shop Products", path: "/products" },
  { label: "Categories", path: "/explore" },
  { label: "Become a Seller", path: "/business-form" },
];

const companyLinks = [
  { label: "About OJA247", path: "/about" },
  { label: "Our Story", path: "/about" },
  { label: "Careers", path: "/about" },
  { label: "Contact", path: "/about" },
];

const supportLinks = [
  { label: "Help Center", path: "/about" },
  { label: "Delivery Information", path: "/about" },
  { label: "Privacy Policy", path: "/about" },
  { label: "Terms & Conditions", path: "/about" },
];

const socialLinks = [
  { Icon: Facebook, href: "https://facebook.com" },
  { Icon: Twitter, href: "https://twitter.com" },
  { Icon: Instagram, href: "https://instagram.com" },
];

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzQBEjk1NUrbDhMXrb4X8fRaoP_vubBJzquJM4EJJL6ufd6i6N_8dGHrIq2PKzQim6Vdg/exec";

const Footer = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const FooterLinkGroup = ({ title, links }) => (
    <div>
      <h3 className="font-bold text-lg mb-5">{title}</h3>

      <ul className="space-y-3 text-gray-400">
        {links.map(({ label, path }) => (
          <li
            key={label}
            onClick={() => navigate(path)}
            className="hover:text-green-400 cursor-pointer transition-colors"
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      setMessage("Thanks for subscribing! 🚀");
      setEmail("");
    } catch (error) {
      console.error("Newsletter error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            <div
              className="flex items-center gap-3 mb-5 cursor-pointer w-fit"
              onClick={() => navigate("/")}
            >
              <img src={Logo1} alt="OJA247" className="w-20 object-contain" />

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
              {socialLinks.map(({ Icon, href }, i) => (
                <motion.a
                  key={i}
                  whileHover={{ y: -5, scale: 1.15 }}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-green-500 transition"
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          <FooterLinkGroup title="Marketplace" links={marketplaceLinks} />

          <FooterLinkGroup title="Company" links={companyLinks} />

          <FooterLinkGroup title="Support" links={supportLinks} />
        </div>

        {/* Newsletter */}
        <div className="mt-16 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Join the OJA247 community 🚀</h3>

            <p className="text-gray-400 mt-2">
              Get updates about new vendors, products and offers.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <form onSubmit={handleSubmit} className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="px-5 py-3 rounded-l-xl bg-white/10 border border-white/10 outline-none text-white w-full md:w-72 placeholder:text-gray-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-r-xl bg-gradient-to-r from-green-500 to-emerald-500 font-bold hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? "Sending..." : "Subscribe"}
              </button>
            </form>

            {message && (
              <p className="mt-3 text-sm text-green-400">{message}</p>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()}
            <span className="text-green-400 font-bold"> OJA247</span>. Made with
            ❤️ in Nigeria 🇳🇬
          </p>

          <p>Built for Sellers. Made for Buyers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
