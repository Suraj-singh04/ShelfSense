import React, { useState } from "react";
import { authorizedFetch } from "../../utils/api";

const AddProductForm = ({ onProductAdded }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [batchId, setBatchId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Adding product...");

    try {
      const productData = {
        name,
        category,
        batches: [
          {
            batchId,
            expiryDate,
          },
        ],
      };
      const res = await authorizedFetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Product added: ${name}`);
        setName("");
        setCategory("");
        setBatchId("");
        setExpiryDate("");
        onProductAdded();
      } else {
        setMessage(`❌ Failed: ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Error adding product", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm mx-auto mt-4 space-y-2"
    >
      <input
        type="text"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Batch ID"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <input
        type="date"
        placeholder="Expiry Date"
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
      >
        ➕ Add Product
      </button>
      {message && <p className="text-center text-sm mt-2">{message}</p>}
    </form>
  );
};
console.log("✅ AddProductForm loaded");

export default AddProductForm;
