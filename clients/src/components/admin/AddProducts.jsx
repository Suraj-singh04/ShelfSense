import React, { useState } from "react";
import {
  Package,
  Plus,
  ShoppingCart,
  Users,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";
import { authorizedFetch } from "../../utils/api";

// AddProducts Component
const AddProducts = ({ onProductAdded }) => {
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
      console.log(err);
      setMessage("❌ Error adding product", err);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-full">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
          Add New Product
        </h2>
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;
