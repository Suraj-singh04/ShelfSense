import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const ManualOrderForm = () => {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("/api/retailer/available-products")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data.data || [];
        setProducts(list);
      })
      .catch(() => {});
  }, []);

  const placeOrder = () => {
    if (!selectedId || !qty || qty <= 0) {
      setMessage("⚠️ Select product and enter a valid quantity.");
      return;
    }

    axios.post("/api/retailer/order", {
      productId: selectedId,
      quantity: Number(qty),
    })
    .then(() => {
      setMessage("✅ Order placed!");
      setQty("");
      setSelectedId("");
    })
    .catch(() => setMessage("❌ Failed to place order."));
  };

  return (
    <div className="flex flex-col items-center text-gray-800 dark:text-white">
      <motion.h2 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📝 Manual Order
      </motion.h2>

      <motion.div className="w-full max-w-md bg-green-50 dark:bg-green-950 p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <label className="block mb-2">Select Product</label>
        <select className="w-full p-2 mb-4 rounded border dark:bg-gray-800"
          onChange={(e) => setSelectedId(e.target.value)}
          value={selectedId}
        >
          <option value="">-- Select Product --</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        <label className="block mb-2">Quantity</label>
        <input type="number" placeholder="Quantity" value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-full p-2 mb-4 rounded border dark:bg-gray-800"
        />

        <button onClick={placeOrder} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
          🛒 Place Order
        </button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </motion.div>
    </div>
  );
};

export default ManualOrderForm;
