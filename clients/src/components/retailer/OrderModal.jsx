// src/components/OrderModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { authorizedFetch } from "../../utils/api";

const OrderModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    setMessage("");

    if (quantity <= 0) {
      setMessage("⚠️ Enter a valid quantity.");
      return;
    }

    try {
      setLoading(true);
      const res = await authorizedFetch("/api/purchase/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id, // <-- FIXED LINE
          quantity: Number(quantity),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Server response (not OK):", text);
        setMessage("❌ Server error while placing order.");
        return;
      }

      setMessage("✅ Order placed successfully!");
    } catch (err) {
      console.error("Order failed:", err);
      setMessage("❌ Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          <X />
        </button>

        <h3 className="text-xl font-semibold mb-2">Order: {product.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Category: {product.category || "N/A"} <br />
          Available: {product.totalQuantity || 0} <br />
          Price: ₹{product.price || "?"}
        </p>

        <label className="block mb-2 font-medium">Quantity</label>
        <input
          type="number"
          value={quantity}
          min={1}
          max={product.totalQuantity || 1}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full p-2 mb-4 rounded border dark:bg-gray-800"
        />

        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Placing..." : "Place Order"}
        </button>

        {message && (
          <p className="mt-4 text-sm text-center font-medium text-green-600 dark:text-green-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
