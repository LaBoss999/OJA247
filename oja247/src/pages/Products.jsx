import { useEffect, useState } from "react";
import { getAllProducts } from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts()
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  // businessId comes back populated from the backend as { _id, name, logo, location }
  const getBusinessId = (product) => product.businessId?._id;
  const getBusinessName = (product) => product.businessId?.name;

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || p.category === categoryFilter;
    return matchesName && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          All Products
        </h1>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 sticky top-0 z-20 bg-gray-50/90 backdrop-blur-sm py-2">
          <div className="relative w-full sm:w-1/2">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 pl-10 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-4">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"} found
          </p>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm mt-3">Loading products…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="h-16 w-16 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  <span
                    className={`absolute top-2 left-2 text-[11px] font-semibold px-2 py-1 rounded-full shadow-sm ${
                      product.inStock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>

                  {!product.inStock && (
                    <div className="absolute inset-0 bg-white/40" />
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  {product.category && (
                    <span className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-1">
                      {product.category}
                    </span>
                  )}
                  <h3 className="font-semibold text-sm sm:text-lg text-gray-900 mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  {getBusinessName(product) && (
                    <p className="text-xs text-gray-400 mb-1">
                      by {getBusinessName(product)}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2 flex-1">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg sm:text-2xl font-bold text-green-600">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>

                  {getBusinessId(product) && (
                    <a
                      href={`/business/${getBusinessId(product)}`}
                      className="flex items-center justify-center w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
                    >
                      View Store
                    </a>
                  )}
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100">
                <svg
                  className="mx-auto h-16 w-16 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No products found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try a different search term or category.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
