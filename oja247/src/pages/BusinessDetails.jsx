import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function BusinessDetails() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/businesses/${id}`)
      .then(res => setBusiness(res.data))
      .catch(err => console.log(err));
  }, [id]);

  if (!business) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
        <p className="text-gray-500 mb-2">{business.category}</p>
        <p className="text-gray-400">{business.location}</p>
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-2">About</h2>
        <p className="text-gray-700">{business.description}</p>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-2">Contact</h2>
        <p className="text-gray-700">{business.contact}</p>
      </div>

      {/* Image Gallery */}
      {business.images && business.images.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {business.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Business image ${index + 1}`}
                className="rounded-md w-full h-48 object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="text-center">
        <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
          Back to All Businesses
        </Link>
      </div>
    </div>
  );
}

export default BusinessDetails;
