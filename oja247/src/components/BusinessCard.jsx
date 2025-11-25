import { Link } from "react-router-dom";

function BusinessCard({ business }) {
  return (
    <Link to={`/business/${business._id}`}>
      <div className="border p-4 rounded shadow hover:shadow-lg transition">
        <h2 className="text-xl font-bold">{business.name}</h2>
        <p className="text-gray-600">{business.category}</p>
        <p className="text-gray-500">{business.location}</p>
      </div>
    </Link>
  );
}

export default BusinessCard;
