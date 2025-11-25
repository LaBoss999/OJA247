import { useState } from "react";

function AddBusiness() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    contact: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      alert("Business added!");
      setForm({
        name: "",
        description: "",
        category: "",
        location: "",
        contact: "",
      });
    } else {
      alert("Error adding business.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Business</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Business Name"
          value={form.name}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="contact"
          placeholder="Contact Info"
          value={form.contact}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">Add Business</button>
      </form>
    </div>
  );
}

export default AddBusiness;
