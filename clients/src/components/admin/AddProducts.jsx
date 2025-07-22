import React, { useState, useEffect } from "react";
import { authorizedFetch } from "../../utils/api";

const AddProducts = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [batchId, setBatchId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [message, setMessage] = useState("");
  const [recentProducts, setRecentProducts] = useState([]);
  // const [image, setImage] = useState(null);

  const fetchRecentProducts = async () => {
    try {
      const res = await authorizedFetch("/api/products/get");
      const data = await res.json();
      if (res.ok) {
        setRecentProducts(data.products || []);
      }
    } catch (err) {
      console.error("Error fetching recent products:", err);
    }
  };

  useEffect(() => {
    fetchRecentProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Adding product...");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("price", price);
      formData.append(
        "batches",
        JSON.stringify([
          {
            batchId,
            expiryDate,
          },
        ])
      );

      const res = await authorizedFetch("/api/products/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category,
          price,
          batches: [{ batchId, expiryDate }],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Product added: ${name}`);
        setName("");
        setCategory("");
        setPrice("");
        setBatchId("");
        setExpiryDate("");
        fetchRecentProducts();
      } else {
        setMessage(`❌ Failed: ${data.message || data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error adding product");
    }
  };
  return (
    <div className="p-6 md:p-10 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          📦 Add New Product
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="📝 Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <input
            type="text"
            placeholder="🔢 Batch ID"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <input
            type="text"
            placeholder="📁 Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <input
            type="number"
            placeholder="💰 Price (e.g. 19.99)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="p-2 border rounded w-full"
            min="0"
            step="0.01"
          />
          <div className="flex items-center gap-4">
            <input type="file" className="p-2 border rounded w-full" />
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded"
            >
              ➕ Add Product
            </button>
            {message && (
              <p className="text-center text-sm mt-2 text-gray-700">
                {message}
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Recent Products Table */}
      <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="🔍 Search by name..."
            className="p-2 border rounded w-1/2"
          />
          <select className="p-2 border rounded text-sm">
            <option>Sort by Purchase Date</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-green-100 text-green-900">
              <tr>
                <th className="p-2">🆔 ID</th>
                <th className="p-2">📦 Name</th>
                <th className="p-2">📁 Category</th>
                <th className="p-2">💰 Price</th>
                <th className="p-2">📅 Expiry</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                recentProducts.map((product) => (
                  <tr key={product._id} className="border-t">
                    <td className="p-2 text-xs text-gray-500">{product._id}</td>
                    <td className="p-2 font-medium">{product.name}</td>
                    <td className="p-2">{product.category}</td>
                    <td className="p-2">₹{product.price}</td>
                    <td className="p-2">
                      {product.batches?.[0]?.expiryDate?.slice(0, 10) || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;
