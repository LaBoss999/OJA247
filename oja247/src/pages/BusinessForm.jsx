import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BusinessForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    // Auth fields
    email: "",
    password: "",
    confirmPassword: "",
    
    // Business fields
    name: "",
    description: "",
    category: "",
    location: "",
    contact: "",
    logo: "",
    banner: "",
    themeColor: "#10B981",
    socialLinks: { 
      facebook: "", 
      instagram: "", 
      twitter: "", 
      website: "" 
    },
    highlights: []
  });

  const [highlightInput, setHighlightInput] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("socialLinks.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [key]: value },
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addHighlight = () => {
    if (highlightInput.trim()) {
      setFormData({
        ...formData,
        highlights: [...formData.highlights, highlightInput.trim()]
      });
      setHighlightInput("");
    }
  };

  const removeHighlight = (index) => {
    setFormData({
      ...formData,
      highlights: formData.highlights.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters!");
      setLoading(false);
      return;
    }

    // Prepare business data (exclude auth fields)
    const businessData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      contact: formData.contact,
      logo: formData.logo,
      banner: formData.banner,
      themeColor: formData.themeColor,
      socialLinks: formData.socialLinks,
      highlights: formData.highlights
    };

    // Register with auth
    const result = await register(formData.email, formData.password, businessData);

    if (result.success) {
      alert("Business registered successfully!");
      navigate(`/dashboard/${result.business._id}`);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
            Register Your Business
          </h2>
          <p className="text-gray-600 mb-6">Join OJA247 and reach thousands of customers</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Authentication Section */}
            <div className="border-b pb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Account Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">You'll use this to login to your dashboard</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="border-b pb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Business Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Mama Chinedu Kitchen"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    placeholder="Tell us about your business..."
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="Food">Food & Drinks</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Tech">Tech & Electronics</option>
                      <option value="Beauty">Beauty & Health</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g., Lagos"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    name="contact"
                    placeholder="e.g., +234 800 000 0000"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">WhatsApp number recommended</p>
                </div>
              </div>
            </div>

            {/* Branding Section */}
            <div className="border-b pb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Branding (Optional)</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    name="logo"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    name="banner"
                    placeholder="https://example.com/banner.png"
                    value={formData.banner}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Theme Color
                  </label>
                  <input
                    type="color"
                    name="themeColor"
                    value={formData.themeColor}
                    onChange={handleChange}
                    className="w-20 h-12 rounded-lg border border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="border-b pb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Social Media (Optional)</h3>
              
              <div className="space-y-4">
                <input
                  type="url"
                  name="socialLinks.facebook"
                  placeholder="Facebook URL"
                  value={formData.socialLinks.facebook}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="url"
                  name="socialLinks.instagram"
                  placeholder="Instagram URL"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="url"
                  name="socialLinks.twitter"
                  placeholder="Twitter URL"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="url"
                  name="socialLinks.website"
                  placeholder="Website URL"
                  value={formData.socialLinks.website}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Highlights Section */}
            <div className="pb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Business Highlights (Optional)</h3>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  placeholder="e.g., Fast Delivery, Affordable Prices"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                />
                <button
                  type="button"
                  onClick={addHighlight}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                >
                  Add
                </button>
              </div>

              {formData.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.highlights.map((highlight, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full"
                    >
                      {highlight}
                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        className="text-green-600 hover:text-green-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 rounded-lg font-bold text-white ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                } shadow-lg`}
              >
                {loading ? 'Registering...' : 'Register Business'}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-green-600 font-semibold hover:text-green-700"
                >
                  Login here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessForm;