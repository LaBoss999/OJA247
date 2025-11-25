import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/businesses")
      .then(res => setBusinesses(res.data))
      .catch(err => console.log(err));
  }, []);

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? business.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(businesses.map(b => b.category))];

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search businesses..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>
        {(searchTerm || categoryFilter) && (
          <button
            onClick={clearFilters}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Businesses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredBusinesses.map((business) => (
          <Link
            key={business._id}
            to={`/business/${business._id}`}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transform transition duration-300"
          >
            <h2 className="text-2xl font-bold mb-2 text-blue-600">{business.name}</h2>
            <p className="text-gray-600 mb-1"><span className="font-semibold">Category:</span> {business.category}</p>
            <p className="text-gray-500 mb-2"><span className="font-semibold">Location:</span> {business.location}</p>
            {business.contact && <p className="text-gray-400"><span className="font-semibold">Contact:</span> {business.contact}</p>}
          </Link>
        ))}
      </div>

      {filteredBusinesses.length === 0 && (
        <p className="text-center text-gray-500 mt-6 text-lg">No businesses found.</p>
      )}
    </div>
  );
}

export default Businesses;
