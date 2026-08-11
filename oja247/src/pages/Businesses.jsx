import { useEffect, useState } from "react";
import { getAllBusinesses } from "../services/api";
import BusinessCard from "../components/BusinessCard";
import Loader from "../components/Loader";
import useMinimumLoadingTime from "../hooks/useMinimumLoadingTime";

function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const showLoader = useMinimumLoadingTime(loading);

  useEffect(() => {
    getAllBusinesses()
      .then((res) => setBusinesses(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(businesses.map((b) => b.category))];

  const filteredBusinesses = businesses.filter((b) => {
    const matchesName = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || b.category === categoryFilter;
    return matchesName && matchesCategory;
  });

  if (showLoader) {
    return <Loader text="Loading businesses..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          All Businesses
        </h1>

        <div className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-sm py-2 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
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
                placeholder="Search by business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 pl-10 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {filteredBusinesses.length}{" "}
          {filteredBusinesses.length === 1 ? "business" : "businesses"} found
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredBusinesses.map((b) => (
            <BusinessCard key={b._id} business={b} />
          ))}
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 mt-4">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No businesses found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Try a different search term or category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Businesses;