import { useState, useEffect } from "react";
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

  const getStatusColor = (status) => {
    switch (status) {
      case "confirm":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8 bg-gradient-to-tr from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center gap-2">
          🛒 All Purchases by Retailers
        </h2>

        <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            {error && <p className="text-red-500 text-center py-4">{error}</p>}

            {purchases.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-lg">
                📭 No purchase records found.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-blue-100 text-blue-900 uppercase text-xs font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4"># Order ID</th>
                    <th className="px-6 py-4">👤 Retailer</th>
                    <th className="px-6 py-4">📦 Product</th>
                    <th className="px-6 py-4">🔢 Quantity</th>
                    <th className="px-6 py-4">💰 Total</th>
                    <th className="px-6 py-4">📅 Date</th>
                    <th className="px-6 py-4">📌 Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchases.map((purchase) =>
                    purchase.orders.map((order) => (
                      <tr
                        key={order._id}
                        className="transition-all hover:bg-blue-50"
                      >
                        <td className="px-6 py-4 font-mono text-gray-700 font-semibold">
                          #{purchase._id}
                        </td>
                        <td className="px-6 py-4">
                          {purchase.retailerName || purchase.retailerId}
                        </td>
                        <td className="px-6 py-4">{order.productName}</td>
                        <td className="px-6 py-4">{order.quantity}</td>
                        <td className="px-6 py-4 font-semibold text-green-600">
                          ₹{order.totalPrice}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(purchase.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(
                              "confirm"
                            )}`}
                          >
                            Confirmed
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllPurchases;
