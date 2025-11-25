import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBusinessById } from "../services/api";

function BusinessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    getBusinessById(id)
      .then((res) => setBusiness(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!business) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
      <p className="text-gray-600 mb-4">{business.category}</p>
      <p className="mb-4">{business.description}</p>
      <p className="mb-2"><strong>Location:</strong> {business.location}</p>
      <p className="mb-2"><strong>Contact:</strong> {business.contact}</p>

      {business.images && business.images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {business.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${business.name} ${idx}`}
              className="rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BusinessDetails;
