import React, { useState } from "react";
import { X } from "lucide-react";
import { authorizedFetch } from "../../utils/api";

const OrderModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    setMessage("");
    if (quantity <= 0) {
      setMessage("⚠️ Enter a valid quantity.");
      return;
    }

    try {
      setLoading(true);
      const res = await authorizedFetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          quantity: Number(quantity),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Server response (not OK):", text);
        setMessage("❌ Failed to add product to cart.");
        return;
      }

      setMessage("✅ Added to cart!");
      setTimeout(() => onClose(), 1000); // close modal after success
    } catch (err) {
      console.error("Add to cart failed:", err);
      setMessage("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = (product.price || 0) * quantity;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-xl relative border border-gray-200 dark:border-gray-700">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center mb-6">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
            />
          )}
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {product.category || "Uncategorized"}
            </p>
          </div>
        </div>

        {/* Product Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="block text-gray-500 dark:text-gray-400">
              Available
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {product.totalQuantity || 0}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="block text-gray-500 dark:text-gray-400">
              Price
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              ₹{product.price || "?"}
            </span>
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            min={1}
            max={product.totalQuantity || 1}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Total */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ₹{isNaN(totalPrice) ? "0" : totalPrice}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm disabled:opacity-50 transition"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>

        {/* Message */}
        {message && (
          <p className="mt-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
