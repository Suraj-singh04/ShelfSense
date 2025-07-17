import React, { useEffect, useState } from "react";
import { authorizedFetch } from "../../utils/api";

const RetailerDetailsFixed = () => {
  const [retailers, setRetailers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        const response = await authorizedFetch("/api/retailer/get");
        const data = await response.json();
        if (response.ok) {
          setRetailers(data.retailers || []);
        } else {
          setError("❌ Failed to load retailers");
        }
      } catch (err) {
        setError("❌ Server error while loading retailers", err);
      }
    };

    fetchRetailers();
  }, []);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">🏪 Retailer Details</h3>
      {error && <p className="text-red-400">{error}</p>}
      {retailers.length === 0 ? (
        <p className="text-sm text-gray-400">📭 No retailers found.</p>
      ) : (
        <div className="overflow-auto max-h-60">
          <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-2 text-left">Retailer</th>
                <th className="p-2 text-left">Location</th>
                <th className="p-2 text-left">Total Purchases</th>
              </tr>
            </thead>
            <tbody>
              {retailers.map((retailer) => (
                <tr
                  key={retailer._id}
                  className="border-t dark:border-gray-600"
                >
                  <td className="p-2">{retailer.name}</td>
                  <td className="p-2">{retailer.location}</td>
                  <td className="p-2">{retailer.count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RetailerDetailsFixed;
