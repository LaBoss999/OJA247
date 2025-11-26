import React, { useState } from "react";
import axios from "axios";

const BusinessForm = () => {
  const [business, setBusiness] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    contact: "",
    images: [],
    logo: "",
    banner: "",
    themeColor: "#ffffff",
    socialLinks: { facebook: "", instagram: "", twitter: "", website: "" },
    products: [], // ← Add this
    highlights: [],
  });
  const handleProductChange = (index, field, value) => {
  const updatedProducts = [...business.products];
  updatedProducts[index][field] = value;
  setBusiness({ ...business, products: updatedProducts });
};

const addProduct = () => {
  setBusiness({
    ...business,
    products: [...business.products, { name: "", description: "", price: "", image: "" }]
  });
};

const removeProduct = (index) => {
  const updatedProducts = business.products.filter((_, i) => i !== index);
  setBusiness({ ...business, products: updatedProducts });
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("socialLinks.")) {
      const key = name.split(".")[1];
      setBusiness((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [key]: value },
      }));
    } else {
      setBusiness({ ...business, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/businesses",
        business
      );
      alert("Business created!");
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
  <div className="p-6 max-w-3xl mx-auto">
    <h2 className="text-3xl font-bold mb-4">Register Your Business</h2>
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Fields */}
      <input
        type="text"
        name="name"
        placeholder="Business Name"
        value={business.name}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={business.description}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="category"
        placeholder="Category"
        value={business.category}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={business.location}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="contact"
        placeholder="Contact"
        value={business.contact}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      {/* Social Links */}
      <h3 className="font-semibold mt-4">Social Links</h3>
      <input
        type="text"
        name="socialLinks.facebook"
        placeholder="Facebook URL"
        value={business.socialLinks.facebook}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="socialLinks.instagram"
        placeholder="Instagram URL"
        value={business.socialLinks.instagram}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="socialLinks.twitter"
        placeholder="Twitter URL"
        value={business.socialLinks.twitter}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="socialLinks.website"
        placeholder="Website URL"
        value={business.socialLinks.website}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      {/* Theme Color */}
      <input
        type="color"
        name="themeColor"
        value={business.themeColor}
        onChange={handleChange}
        className="w-16 h-10 rounded border"
      />

      {/* Products Section */}
      <h3 className="font-semibold mt-4">Products</h3>
      {business.products.map((product, index) => (
        <div key={index} className="border p-4 mb-2 rounded space-y-2">
          <input
            type="text"
            placeholder="Product Name"
            value={product.name}
            onChange={(e) => handleProductChange(index, "name", e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Product Description"
            value={product.description}
            onChange={(e) => handleProductChange(index, "description", e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Price"
            value={product.price}
            onChange={(e) => handleProductChange(index, "price", e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={product.image}
            onChange={(e) => handleProductChange(index, "image", e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            type="button"
            onClick={() => removeProduct(index)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addProduct}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Add Product
      </button>

      {/* Submit Button */}
      <button
        type="submit"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  </div>
);
};

export default BusinessForm;