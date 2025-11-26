import { Link } from "react-router-dom";

function BusinessCard({ business }) {
  return (
    <Link to={`/businesses/${business._id}`}>
      <div className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer">
        <img
          src={business.logo || "https://via.placeholder.com/150"}
          alt={business.name}
          className="w-full h-40 object-cover rounded"
        />

        <h2 className="text-xl font-bold mt-3">{business.name}</h2>
        <p className="text-gray-600">{business.category}</p>
      </div>
    </Link>
  );
}

export default BusinessCard;
