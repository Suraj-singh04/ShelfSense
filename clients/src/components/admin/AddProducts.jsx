import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { authorizedFetch } from "../../utils/api";

export default function ProductManager() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [batchId, setBatchId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [message, setMessage] = useState("");
  const [recentProducts, setRecentProducts] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch existing products
  useEffect(() => {
    fetchRecentProducts();
  }, []);

  const fetchRecentProducts = async () => {
    try {
      const res = await authorizedFetch("/api/products/get");
      const data = await res.json();
      if (res.ok) setRecentProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching recent products:", err);
    }
  };

  // Handle image preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Uploading images...");

    try {
      let imageUrls = [];

      // Upload images
      if (images.length > 0) {
        const uploadPromises = images.map(async (file) => {
          const formData = new FormData();
          formData.append("image", file);

          const res = await fetch("http://localhost:5000/api/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (!res.ok)
            throw new Error(data.message || data.error || "Upload failed");
          return data.imageUrl;
        });

        imageUrls = await Promise.all(uploadPromises);
      }

      setMessage("📦 Saving product...");

      // Save product
      const productPayload = {
        name,
        category,
        price,
        batches: [{ batchId, expiryDate }],
        imageUrl: imageUrls[0],
      };

      const res = await authorizedFetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Product added: ${name}`);

        // Reset form
        setName("");
        setCategory("");
        setPrice("");
        setBatchId("");
        setExpiryDate("");
        setImages([]);
        setImagePreviews([]);
        fetchRecentProducts();
      } else {
        setMessage(`❌ Failed: ${data.message || data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  // Filter products by search
  const filteredProducts = recentProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-10">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">
          ⚡ Product Manager
        </h1>
        <p className="text-gray-400 mt-2">
          Effortlessly manage your inventory with our streamlined system
        </p>
      </div>

      {/* ADD PRODUCT FORM */}
      <motion.form
        onSubmit={handleSubmit}
        whileHover={{ scale: 1.01 }}
        className="bg-gray-900/70 border border-gray-700 rounded-2xl shadow-lg p-6 mb-10 backdrop-blur-md"
      >
        <h2 className="text-xl font-semibold mb-6 text-purple-400 flex items-center gap-2">
          <span className="text-2xl">➕</span> Add New Product
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 hover:border-purple-500 transition"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 hover:border-purple-500 transition"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 hover:border-purple-500 transition"
            required
          />
          <input
            type="text"
            placeholder="Batch ID"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 hover:border-purple-500 transition"
            required
          />
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 hover:border-purple-500 transition"
            required
          />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition"
          />
        </div>

        {/* Show Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="col-span-3 flex gap-4 flex-wrap mt-4">
            {imagePreviews.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-gray-700"
              />
            ))}
          </div>
        )}

        <button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg shadow-md hover:shadow-purple-500/40 transition-all w-full">
          ➕ Add Product
        </button>

        {message && (
          <p className="text-center text-sm mt-3 text-gray-300">{message}</p>
        )}
      </motion.form>

      {/* PRODUCT LIST */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        className="bg-gray-900/70 border border-gray-700 rounded-2xl shadow-lg p-6 backdrop-blur-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
            <span className="text-2xl">📦</span> Recent Products
          </h3>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-green-500 hover:border-green-500 transition"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2">Image</th>
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Price</th>
                <th className="text-left py-2">Batch</th>
                <th className="text-left py-2">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <motion.tr
                    whileHover={{
                      scale: 1.01,
                      backgroundColor: "rgba(147, 51, 234, 0.15)",
                    }}
                    key={p._id}
                    className="border-b border-gray-800 transition cursor-pointer"
                  >
                    <td className="py-3">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 font-semibold">
                      {p.name}
                      <div className="text-xs text-gray-500">ID: {p._id}</div>
                    </td>
                    <td className="py-3">
                      <span className="bg-green-800/40 text-green-300 px-2 py-1 rounded-full text-xs">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 text-purple-400 font-bold">
                      ₹{p.price}
                    </td>
                    <td className="py-3">{p.batches?.[0]?.batchId || "—"}</td>
                    <td className="py-3 text-gray-300">
                      {p.batches?.[0]?.expiryDate?.slice(0, 10) || "—"}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
