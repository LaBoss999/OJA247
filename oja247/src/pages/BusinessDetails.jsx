import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBusinessById, getProductsByBusiness } from "../services/api";
import { useCart } from "../context/CartContext";
import Loader from "../components/Loader";
import useMinimumLoadingTime from "../hooks/useMinimumLoadingTime";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const DAY_LABELS = {
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};

// business.hours expected shape:
// { monday: { open: "09:00", close: "18:00", closed: false }, ... }
function getOpenStatus(hours) {
  if (!hours) return null;

  const now = new Date();
  const todayKey = DAY_KEYS[now.getDay()];
  const today = hours[todayKey];

  if (!today || today.closed) {
    return { isOpen: false, label: "Closed today" };
  }

  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;

  return {
    isOpen,
    label: isOpen
      ? `Open now · closes ${formatTime(today.close)}`
      : `Closed · opens ${formatTime(today.open)}`,
  };
}

function formatTime(t) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12}${period}` : `${hour12}:${String(m).padStart(2, "0")}${period}`;
}

function formatMemberSince(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function StarRating({ rating }) {
  const rounded = Math.round(rating * 2) / 2; // nearest half star
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="w-4 h-4"
          fill={i <= rounded ? "#f59e0b" : "#e5e7eb"}
        >
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.61.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function BusinessDetails() {
  const { id } = useParams();
  const { addToCart, itemCount } = useCart();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const showLoader = useMinimumLoadingTime(loading);

  useEffect(() => {
    fetchBusinessAndProducts();
  }, [id]);

  const fetchBusinessAndProducts = async () => {
    try {
      // Fetch business details
      const businessRes = await getBusinessById(id);
      setBusiness(businessRes.data);
      setIsFollowing(Boolean(businessRes.data.isFollowedByUser));
      setFollowerCount(businessRes.data.followerCount || 0);

      // Fetch products for this business
      const productsRes = await getProductsByBusiness(id);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from products
  const categories = ["all", ...new Set(products.map((p) => p.category))];

  // Filter products by category
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: business?.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleFollowToggle = async () => {
    // Optimistic update
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    setFollowerCount((c) => (nextFollowing ? c + 1 : Math.max(0, c - 1)));

    try {
      // Replace with your actual follow/unfollow endpoint, e.g.:
      // nextFollowing ? await followBusiness(id) : await unfollowBusiness(id);
    } catch (error) {
      console.error("Error updating follow status:", error);
      // Roll back on failure
      setIsFollowing(!nextFollowing);
      setFollowerCount((c) => (!nextFollowing ? c + 1 : Math.max(0, c - 1)));
    }
  };

  if (showLoader) {
    return <Loader text="Loading store..." />;
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600 text-lg font-medium">Business not found</p>
      </div>
    );
  }

  const openStatus = getOpenStatus(business.hours);
  const memberSince = formatMemberSince(business.createdAt);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div
        className="relative w-full h-56 sm:h-72 bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: business.banner ? `url(${business.banner})` : "",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* subtle overlay for legibility whether image or gradient */}
        <div className="absolute inset-0 bg-black/10" />
        {!business.banner && (
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white drop-shadow-lg text-center px-4">
            Welcome to {business.name}
          </h2>
        )}
      </div>

      {/* Logo + Name Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
          <img
            src={business.logo || "https://via.placeholder.com/120"}
            alt={business.name}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl object-cover flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 truncate">
                {business.name}
              </h1>
              {business.isVerified && (
                <span
                  className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 rounded-full flex-shrink-0"
                  title="Verified business"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>

            {/* Rating + Member since */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-1.5">
              {typeof business.rating === "number" && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                  <StarRating rating={business.rating} />
                  <span className="font-semibold">{business.rating.toFixed(1)}</span>
                  {typeof business.reviewCount === "number" && (
                    <span className="text-gray-400">({business.reviewCount})</span>
                  )}
                </span>
              )}
              {memberSince && (
                <span className="text-sm text-gray-400">Member since {memberSince}</span>
              )}
            </div>

            {business.description && (
              <p className="text-gray-600 mt-2 text-base sm:text-lg leading-relaxed">
                {business.description}
              </p>
            )}

            {/* Tags */}
            {business.tags && business.tags.length > 0 && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                {business.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 mt-4 text-sm text-gray-500">
              {business.category && (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
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
              {business.location && (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
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
              {business.contact && (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
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
              {openStatus && (
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      openStatus.isOpen ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span className={openStatus.isOpen ? "text-green-700 font-medium" : ""}>
                    {openStatus.label}
                  </span>
                </span>
              )}
            </div>

            {/* Delivery info */}
            {business.delivery?.available && (
              <div className="inline-flex items-center gap-3 mt-3 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600">
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1m0 0a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0"
                  />
                </svg>
                <span>
                  Delivery available
                  {business.delivery.estimatedTime && ` · ${business.delivery.estimatedTime}`}
                  {typeof business.delivery.fee === "number" &&
                    ` · ₦${business.delivery.fee.toLocaleString()} fee`}
                </span>
              </div>
            )}

            {/* Social Links + Share + Follow */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
              {business.socialLinks?.facebook && (
                <a
                  href={business.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {business.socialLinks?.instagram && (
                <a
                  href={business.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {business.socialLinks?.website && (
                <a
                  href={business.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </a>
              )}

              {/* Share button */}
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-full px-3 py-1.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.684 13.342a3 3 0 100-2.684m0 2.684a3 3 0 100 2.684m0-2.684l6.632-3.316m-6.632 6l6.632 3.316m0-9.632a3 3 0 100 2.684m0-2.684a3 3 0 100 2.684"
                  />
                </svg>
                {copyFeedback ? "Link copied!" : "Share"}
              </button>

              {/* Follow button */}
              <button
                type="button"
                onClick={handleFollowToggle}
                className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-full px-4 py-1.5 transition-colors ${
                  isFollowing
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isFollowing ? "Following" : "Follow store"}
                {followerCount > 0 && (
                  <span className={isFollowing ? "text-gray-400" : "text-green-100"}>
                    · {followerCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Header with Category Filter — sticky so it stays visible while browsing */}
        <div className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 flex flex-wrap justify-between items-center gap-3 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Products{" "}
            <span className="text-gray-400 font-normal">
              ({filteredProducts.length})
            </span>
          </h2>

          <div className="flex items-center gap-3">
            {products.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      selectedCategory === cat
                        ? "bg-green-600 border-green-600 text-white shadow-sm"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {cat === "all" ? "All Categories" : cat}
                  </button>
                ))}
              </div>
            )}

            <a
              href="/cart"
              className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-full shadow-sm relative"
              aria-label="View cart"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 19h.01M15 19h.01"
                />
              </svg>
              <span className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full min-w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                {itemCount}
              </span>
            </a>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
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
              No products available
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              This store hasn't added any products yet.
            </p>
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

                  {/* Stock badge floats over the image, e-commerce style */}
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
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2 flex-1">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg sm:text-2xl font-bold text-gray-900">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Add to cart button */}
                  <button
                    type="button"
                    onClick={() => addToCart(product, business)}
                    disabled={!product.inStock}
                    className={`flex items-center justify-center gap-2 w-full text-center py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                      product.inStock
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 19h.01M15 19h.01"
                      />
                    </svg>
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating WhatsApp Button */}
      {business.contact && (
        <a
          href={`https://wa.me/${business.contact}?text=Hi%20${business.name},%20I'm%20interested%20in%20your%20products.`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-30 bg-green-500 hover:bg-green-600 text-white px-5 py-3 sm:px-6 sm:py-4 rounded-full shadow-2xl flex items-center gap-3 text-base sm:text-lg font-medium transition-transform hover:scale-105"
        >
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span className="hidden sm:inline">Chat with Us</span>
        </a>
      )}
    </div>
  );
}

export default BusinessDetails;