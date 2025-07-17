import React, { useEffect, useState } from "react";
import { suggestionAPI } from "../../api";

const SuggestedPurchases = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await suggestionAPI.getRetailerSuggestions();
        if (response.success) {
          setSuggestions(response.data || []);
        } else {
          setError("❌ Failed to load suggestions");
        }
      } catch (err) {
        setError("❌ Server error while loading suggestions");
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">✨ Suggested Purchases</h3>
      {error && <p className="text-red-400">{error}</p>}
      {suggestions.length === 0 ? (
        <p className="text-sm text-gray-400">📭 No suggestions available.</p>
      ) : (
        <div className="overflow-auto max-h-60">
          <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-2 text-left">Retailer</th>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Suggested Qty</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s, i) => (
                <tr key={i} className="border-t dark:border-gray-600">
                  <td className="p-2">{s.retailerName}</td>
                  <td className="p-2">{s.productName}</td>
                  <td className="p-2">{s.quantity}</td>
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
