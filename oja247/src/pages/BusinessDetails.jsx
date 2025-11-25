import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function BusinessDetails() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/businesses/${id}`)
      .then(res => setBusiness(res.data))
      .catch(err => console.log(err));
  }, [id]);

  if (!business) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
      <p className="text-gray-700">{business.description}</p>

      <div className="mt-4">
        <p><strong>Category:</strong> {business.category}</p>
        <p><strong>Location:</strong> {business.location}</p>
        <p><strong>Contact:</strong> {business.contact}</p>
      </div>

      <div className="mt-6">
        <a href="/" className="text-blue-600 underline">
          ← Back to Businesses
        </a>
      </div>
    </div>
  );
}

export default BusinessDetails;
