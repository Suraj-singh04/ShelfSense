import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { suggestionAPI } from "../../api";

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await suggestionAPI.getRetailerSuggestions();
        if (response.success) {
          setSuggestions(response.data || []);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        setError("❌ Failed to load suggestions.");
      }
    };

    fetchSuggestions();
  }, []);

  const handleAction = async (id, action) => {
    try {
      let response;
      if (action === "confirm") {
        response = await suggestionAPI.confirm(id);
      } else {
        response = await suggestionAPI.reject(id);
      }
      
      if (response.success) {
        setSuggestions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Error handling suggestion:", err);
    }
  };

  return (
    <div className="flex flex-col items-center text-gray-800 dark:text-white">
      <motion.h2 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        💡 Smart Suggestions
      </motion.h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="w-full max-w-3xl space-y-4">
        {suggestions.length === 0 ? (
          <motion.p className="text-gray-500 dark:text-gray-400 animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No suggestions available.
          </motion.p>
        ) : (
          suggestions.map((item) => (
            <motion.div key={item._id} className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950 rounded-lg shadow-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-lg font-semibold">{item.product?.name}</p>
              <p><strong>Qty:</strong> {item.quantity}</p>
              <p><strong>Reason:</strong> {item.reason}</p>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleAction(item._id, "confirm")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  ✅ Accept
                </button>
                <button
                  onClick={() => handleAction(item._id, "reject")}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  ❌ Reject
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Suggestions;
