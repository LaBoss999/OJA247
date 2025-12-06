import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function BusinessDetails() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Cart state (stored in localStorage)
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  useEffect(() => {
    fetchBusinessAndProducts();
  }, [id]);

  const fetchBusinessAndProducts = async () => {
    try {
      const businessRes = await axios.get(`http://localhost:5000/api/businesses/${id}`);
      console.log("Business Data:", businessRes.data);
      setBusiness(businessRes.data);

      const productsRes = await axios.get(`http://localhost:5000/api/products/business/${id}`);
      console.log("Products Data:", productsRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add to Cart function
  const addToCart = (product) => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert(`${product.name} added to cart`);
  };

  const categories = ["all", ...new Set(products.map((p) => p.category))];
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  if (loading) return <p className="p-6 text-center text-lg">Loading...</p>;
  if (!business) return <p className="p-6 text-center text-red-600">Business not found</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div
        className="w-full h-64 flex items-center justify-center bg-gray-300 bg-cover bg-center"
        style={{
          backgroundImage: business?.banner ? `url(${business.banner})` : undefined,
        }}
      >
        {!business?.banner && (
          <h2 className="text-4xl font-bold text-white drop-shadow-lg">
            Welcome to {business?.name || "Business"}
          </h2>
        )}
      </div>

      {/* Logo + Name Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-20">
        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-6">
          <img
            src={business?.logo || "https://via.placeholder.com/120"}
            alt={business?.name || "Business Logo"}
            className="w-32 h-32 rounded-full border-4 shadow-xl object-cover"
            style={{ borderColor: business?.themeColor || "#3B82F6" }}
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h1 className="text-4xl font-bold text-gray-900">{business?.name}</h1>

              {/* Cart Badge with Link */}
              <Link to="/cart" className="relative cursor-pointer">
                <svg
                  className="w-8 h-8 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8h13.2L17 13M7 13H5.4M17 13l1.6 8M6 21h12"
                  />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 text-xs">
                    {cart.length}
                  </span>
                )}
              </Link>
            </div>

            <p className="text-gray-600 mt-2 text-lg">{business?.description}</p>

            <div className="flex gap-6 mt-4 text-sm">
              {business?.category && (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {business.category}
                </span>
              )}

              {business?.location && (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {business.location}
                </span>
              )}

              {business?.contact && (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {business.contact}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Products ({filteredProducts.length})
          </h2>
          {products.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No products available
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-56 bg-gray-200 overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-green-600">
                      ₦{product.price?.toLocaleString()}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.inStock
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  {product.inStock && (
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium mb-2"
                    >
                      Add to Cart
                    </button>
                  )}

                  {business?.contact && (
                    <a
                      href={`https://wa.me/${business.contact}?text=Hi%20${business.name},%20I'm%20interested%20in%20${product.name}%20(₦${product.price})`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition"
                    >
                      Contact Seller
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating WhatsApp Button */}
      {business?.contact && (
        <a
          href={`https://wa.me/${business.contact}?text=Hi%20${business.name},%20I'm%20interested%20in%20your%20products.`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 text-lg font-medium transition-transform hover:scale-105"
        >
          Chat with Us
        </a>
      )}
    </div>
  );
}

export default BusinessDetails;
