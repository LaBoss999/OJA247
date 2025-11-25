import { useEffect, useState } from "react";
import { getAllBusinesses } from "../services/api";
import BusinessCard from "../components/BusinessCard";

function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    getAllBusinesses()
      .then(res => setBusinesses(res.data))
      .catch(err => console.log(err));
  }, []);

  // Get unique categories for the filter dropdown
  const categories = ["All", ...new Set(businesses.map(b => b.category))];

  // Filter businesses based on search term and category
  const filteredBusinesses = businesses.filter(b => {
    const matchesName = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || b.category === categoryFilter;
    return matchesName && matchesCategory;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Businesses</h1>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by business name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full sm:w-1/2"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full sm:w-1/4"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Business Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredBusinesses.map(b => (
          <BusinessCard key={b._id} business={b} />
        ))}
        {filteredBusinesses.length === 0 && (
          <p className="text-gray-500 col-span-full">No businesses found.</p>
        )}
      </div>
    </div>
  );
}

export default Businesses;
