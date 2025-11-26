import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/businesses/${id}`);
        setBusiness(res.data);
      } catch (err) {
        console.error("Error fetching business:", err);
      }
    };
    fetchBusiness();
  }, [id]);

  if (!business) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: business.themeColor || "#f0f0f0" }}
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        Back
      </button>

      {/* Business Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold">{business.name}</h1>
        <p className="text-lg text-gray-700">{business.description}</p>
        <p className="text-sm text-gray-600">{business.location}</p>
        <p className="text-sm text-gray-600">Contact: {business.contact}</p>
      </header>

      {/* Social Links */}
      <div className="flex justify-center space-x-4 mb-6">
        {business.socialLinks.facebook && (
          <a href={business.socialLinks.facebook} target="_blank" rel="noreferrer">
            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              Facebook
            </button>
          </a>
        )}
        {business.socialLinks.instagram && (
          <a href={business.socialLinks.instagram} target="_blank" rel="noreferrer">
            <button className="px-3 py-1 bg-pink-500 text-white rounded hover:bg-pink-600">
              Instagram
            </button>
          </a>
        )}
        {business.socialLinks.twitter && (
          <a href={business.socialLinks.twitter} target="_blank" rel="noreferrer">
            <button className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500">
              Twitter
            </button>
          </a>
        )}
        {business.socialLinks.website && (
          <a href={business.socialLinks.website} target="_blank" rel="noreferrer">
            <button className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900">
              Website
            </button>
          </a>
        )}
      </div>

      {/* Products */}
      {business.products && business.products.length > 0 && (
        <section className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {business.products.map((product, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition"
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover mb-2 rounded"
                  />
                )}
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="text-gray-600">{product.description}</p>
                <p className="font-bold mt-2">${product.price}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BusinessDetails;
