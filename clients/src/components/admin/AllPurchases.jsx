import React, { useEffect, useState } from "react";
import { authorizedFetch } from "../../utils/api";

const AllPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await authorizedFetch("/api/purchase/get");
        const data = await res.json();
        if (data.success) {
          setPurchases(data.purchases);
        } else {
          setError("❌ Failed to load purchases.");
        }
      } catch (err) {
        console.error(err);
        setError("❌ Server error while loading purchases.");
      }
    };
    fetchPurchases();
  }, []);

  return (
    <div className="max-h-64 overflow-y-auto w-full text-sm">
      <h3 className="text-lg font-semibold text-center mb-4">
        🧾 All Purchases
      </h3>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {purchases.length === 0 ? (
        <p className="text-gray-500 text-center">
          📭 No purchase records found.
        </p>
      ) : (
        <ul className="space-y-2">
          {purchases.map((p) => (
            <li
              key={p._id}
              className="border p-3 rounded-lg bg-blue-50 dark:bg-blue-900 shadow-sm"
            >
              <p>
                <strong>🛍️ Retailer:</strong> {p.retailerName || "Unknown"}
              </p>
              <p>
                <strong>📦 Product:</strong> {p.productName || "Unknown"}
              </p>
              <p>
                <strong>🔢 Qty:</strong> {p.quantity}
              </p>
              <p>
                <strong>📅 Date:</strong>{" "}
                {new Date(p.date).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllPurchases;
