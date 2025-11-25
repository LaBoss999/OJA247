import { useEffect, useState } from "react";
import axios from "axios";

function Businesses() {
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/businesses")
      .then(res => setBusinesses(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">All Businesses</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {businesses.map(biz => (
          <div key={biz._id} className="border p-4 rounded shadow">
            <h2 className="font-semibold text-xl">{biz.name}</h2>
            <p className="text-gray-600">{biz.category}</p>
            <p>{biz.location}</p>
            <p className="text-sm opacity-70">{biz.description}</p>

            <a 
              href={`/business/${biz._id}`} 
              className="text-blue-600 underline block mt-2"
            >
              View Business →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Businesses;
