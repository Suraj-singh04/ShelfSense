import React, { useEffect, useState } from "react";
import { authorizedFetch } from "../../utils/api";

const SuggestedPurchases = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  const fetchSuggestions = async () => {
    try {
      const res = await authorizedFetch(
        "/api/suggestions/retailer/pending-suggestions"
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setSuggestions(data.suggestions);
      } else {
        setError("❌ Failed to load suggestions");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("❌ Server error while loading suggestions");
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await authorizedFetch(`/api/suggestions/${action}/${id}`, {
        method: "POST",
      });

      if (res.ok) {
        setSuggestions((prev) => prev.filter((s) => s._id !== id));
      } else {
        const err = await res.json();
        console.error(`❌ ${action} failed:`, err.message);
      }
    } catch (err) {
      console.error(`❌ ${action} error:`, err);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">💡 Suggested Purchases</h3>
      {error && <p className="text-red-500">{error}</p>}

      {suggestions.length === 0 ? (
        <p className="text-sm text-gray-400">📭 No suggestions available.</p>
      ) : (
        <div className="overflow-auto max-h-60">
          <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Quantity</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s) => (
                <tr key={s._id} className="border-t dark:border-gray-600">
                  <td className="p-2">{s.productId?.name}</td>
                  <td className="p-2">{s.quantity}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleAction(s._id, "confirm")}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      ✅ Confirm
                    </button>
                    <button
                      onClick={() => handleAction(s._id, "reject")}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      ❌ Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SuggestedPurchases;
