import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBusinessById } from "../services/api";
import ProductCard from "../components/ProductCard";

function BusinessDetails() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    getBusinessById(id)
      .then((res) => setBusiness(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  if (!business) return <p className="p-6">Loading...</p>;

  return (
    <div>
      {/* Banner */}
      <div
        className="w-full h-48 bg-gray-300 flex items-center justify-center"
        style={{
          backgroundImage: business.banner ? `url(${business.banner})` : "",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!business.banner && (
          <h2 className="text-3xl font-bold">Store Banner</h2>
        )}
      </div>

      {/* Logo + Name */}
      <div className="p-6 -mt-16 flex items-center gap-4">
        <img
          src={business.logo || "https://via.placeholder.com/120"}
          className="w-28 h-28 rounded-full border-4 shadow-lg"
          style={{ borderColor: business.themeColor || "#000" }}
        />

        <div>
          <h1 className="text-3xl font-bold">{business.name}</h1>
          <p className="text-gray-600">{business.description}</p>
        </div>
      </div>

      {/* Social + Info */}
      <div className="px-6">
        <p>
          <strong>Category:</strong> {business.category}
        </p>
        <p>
          <strong>Location:</strong> {business.location}
        </p>
        <p>
          <strong>Contact:</strong> {business.contact}
        </p>

        <div className="flex gap-4 mt-2">
          {business.socialLinks?.facebook && (
            <a href={business.socialLinks.facebook} className="text-blue-600">
              Facebook
            </a>
          )}
          {business.socialLinks?.instagram && (
            <a href={business.socialLinks.instagram} className="text-pink-600">
              Instagram
            </a>
          )}
          {business.socialLinks?.website && (
            <a href={business.socialLinks.website} className="text-green-600">
              Website
            </a>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Products</h2>

        {business.products.length === 0 && (
          <p className="text-gray-500">This store has no products yet.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {business.products.map((p, index) => (
            <ProductCard key={index} product={p} />
          ))}

          {business.contact && (
            <a
              href={`https://wa.me/${business.contact}?text=Hi%20${business.name},%20I'm%20interested%20in%20your%20products.`}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 text-lg transition"
            >
              <span>💬</span>
              <span>Chat on WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default BusinessDetails;
