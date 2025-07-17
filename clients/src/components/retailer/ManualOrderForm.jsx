import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { authorizedFetch } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const ManualOrderForm = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await authorizedFetch("/api/inventory/get");
        const data = await res.json();

        const list = Array.isArray(data)
          ? data
          : data.data || data.products || [];
        setProducts(list);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
        setMessage("⚠️ Could not load products.");
      }
    };

    fetchProducts();
  }, []);

  const placeOrder = async () => {
    setMessage("");

    if (!selectedId || !qty || Number(qty) <= 0) {
      setMessage("⚠️ Select a product and enter a valid quantity.");
      return;
    }

    try {
      setLoading(true);
      const res = await authorizedFetch("/api/purchase/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedId,
          quantity: Number(qty),
        }),
      });

      if (!res.ok) {
        const text = await res.text(); // capture raw response
        console.error("❌ Server response (not OK):", text);
        setMessage("❌ Server error while placing order.");
        return;
      }

      const result = await res.json();
      setMessage("✅ Order placed successfully!");
      setQty("");
      setSelectedId("");
    } catch (err) {
      console.error("❌ Order Error:", err);
      setMessage("❌ Something went wrong while placing order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-gray-800 dark:text-white">
      <motion.h2
        className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📝 Manual Order
      </motion.h2>

      <motion.div
        className="w-full max-w-md bg-green-50 dark:bg-green-950 p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <label className="block mb-2 font-medium">Select Product</label>
        <select
          className="w-full p-2 mb-4 rounded border dark:bg-gray-800"
          onChange={(e) => setSelectedId(e.target.value)}
          value={selectedId}
        >
          <option value="">-- Select Product --</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name || p.product?.name || "Unnamed"}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-medium">Quantity</label>
        <input
          type="number"
          placeholder="Enter quantity"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-full p-2 mb-4 rounded border dark:bg-gray-800"
        />

        <button
          onClick={placeOrder}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Placing..." : "🛒 Place Order"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm font-medium">{message}</p>
        )}
      </motion.div>
    </div>
  );
};

export default ManualOrderForm;
