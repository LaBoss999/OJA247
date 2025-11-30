import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ExplorePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchQuery, selectedCategory]);

  const fetchBusinesses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/businesses');
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBusinesses = () => {
    let filtered = [...businesses];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(b => b.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(query) ||
        b.description?.toLowerCase().includes(query) ||
        b.category?.toLowerCase().includes(query) ||
        b.location?.toLowerCase().includes(query)
      );
    }

    setFilteredBusinesses(filtered);
  };

  const categories = ['all', ...new Set(businesses.map(b => b.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search businesses, products, categories..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredBusinesses.length} of {businesses.length} businesses
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredBusinesses.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBusinesses.map((business) => (
              <div
                key={business._id}
                onClick={() => navigate(`/business/${business._id}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Business Banner */}
                <div
                  className="h-40 bg-gradient-to-r from-gray-300 to-gray-400 relative"
                  style={{
                    backgroundImage: business.banner ? `url(${business.banner})` : '',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Category Badge */}
                  {business.category && (
                    <span className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                      {business.category}
                    </span>
                  )}
                </div>

                {/* Business Info */}
                <div className="p-5 -mt-12">
                  <img
                    src={business.logo || 'https://via.placeholder.com/80'}
                    alt={business.name}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-3 object-cover"
                  />
                  
                  <h3 className="font-bold text-lg mb-2 truncate" title={business.name}>
                    {business.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
                    {business.description || 'No description available'}
                  </p>

                  {/* Location */}
                  {business.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <span className="truncate">{business.location}</span>
                    </div>
                  )}

                  {/* Highlights */}
                  {business.highlights && business.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {business.highlights.slice(0, 3).map((highlight, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* View Store Button */}
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
                    View Store
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back to Top Button (shows after scrolling) */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition"
        title="Back to top"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default ExplorePage;