import { useState, useEffect, useMemo } from "react";
import { authorizedFetch } from "../../utils/api";
import {
  FaShoppingCart,
  FaUsers,
  FaMoneyBillWave,
  FaChartLine,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AllPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await authorizedFetch("/api/purchase/admin/get");
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

  // --- INSIGHTS CALCULATIONS ---
  const stats = useMemo(() => {
    if (!purchases.length) return {};
    const totalOrders = purchases.reduce((sum, p) => sum + p.orders.length, 0);
    const totalRevenue = purchases.reduce(
      (sum, p) => sum + p.orders.reduce((s, o) => s + o.totalPrice, 0),
      0
    );
    const retailerCount = new Map();
    purchases.forEach((p) => {
      const retailer = p.retailerName || p.retailerId;
      const total = p.orders.reduce((s, o) => s + o.totalPrice, 0);
      retailerCount.set(retailer, (retailerCount.get(retailer) || 0) + total);
    });
    const topRetailer = [...retailerCount.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0];
    const avgOrder = totalRevenue / totalOrders;

    return {
      totalOrders,
      totalRevenue,
      avgOrder,
      topRetailer: topRetailer ? topRetailer[0] : "N/A",
    };
  }, [purchases]);

  const revenueTrend = useMemo(() => {
    return purchases.map((p) => ({
      date: new Date(p.date).toLocaleDateString(),
      revenue: p.orders.reduce((s, o) => s + o.totalPrice, 0),
    }));
  }, [purchases]);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirm":
        return "bg-green-900/40 text-green-300 border border-green-600";
      default:
        return "bg-gray-800 text-gray-300 border border-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900/70 border border-gray-700  text-white p-8">
      <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400 mb-8 flex items-center gap-2">
        🛒 Purchases Dashboard
      </h2>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-gray-900/80 rounded-2xl p-6 shadow-lg border border-gray-800 hover:shadow-purple-500/20 transition-all">
          <FaShoppingCart className="text-purple-400 text-2xl mb-2" />
          <h3 className="text-lg font-semibold">Total Orders</h3>
          <p className="text-2xl font-bold">{stats.totalOrders || 0}</p>
        </div>
        <div className="bg-gray-900/80 rounded-2xl p-6 shadow-lg border border-gray-800 hover:shadow-green-500/20 transition-all">
          <FaMoneyBillWave className="text-green-400 text-2xl mb-2" />
          <h3 className="text-lg font-semibold">Total Revenue</h3>
          <p className="text-2xl font-bold">
            ₹{stats.totalRevenue?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-gray-900/80 rounded-2xl p-6 shadow-lg border border-gray-800 hover:shadow-blue-500/20 transition-all">
          <FaUsers className="text-blue-400 text-2xl mb-2" />
          <h3 className="text-lg font-semibold">Top Retailer</h3>
          <p className="text-xl font-bold">{stats.topRetailer}</p>
        </div>
        <div className="bg-gray-900/80 rounded-2xl p-6 shadow-lg border border-gray-800 hover:shadow-yellow-500/20 transition-all">
          <FaChartLine className="text-yellow-400 text-2xl mb-2" />
          <h3 className="text-lg font-semibold">Avg Order Value</h3>
          <p className="text-2xl font-bold">
            ₹{stats.avgOrder?.toFixed(0) || 0}
          </p>
        </div>
      </div>

      {/* --- MAIN GRID: PURCHASE CARDS + SIDEBAR --- */}
      <div className="grid grid-cols-[2fr,1fr] gap-8">
        {/* LEFT: CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {error && <p className="text-red-400 text-center py-4">{error}</p>}
          {purchases.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-lg col-span-2">
              📭 No purchase records found.
            </div>
          ) : (
            purchases.map((purchase) =>
              purchase.orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-purple-500/20 transition-all flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-purple-300">
                      {purchase.retailerName || purchase.retailerId}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "confirm"
                          ? getStatusColor(order.status)
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </div>

                  <p className="text-gray-300 font-medium">
                    {order.productName}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Order ID: #{purchase._id}
                  </p>

                  <div className="flex justify-between mt-3">
                    <p className="text-sm text-blue-400">
                      Qty: {order.quantity}
                    </p>
                    <p className="text-green-400 font-bold">
                      ₹{order.totalPrice.toLocaleString()}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(purchase.date).toLocaleDateString()}
                  </p>
                </div>
              ))
            )
          )}
        </div>

        {/* RIGHT: INSIGHTS SIDEBAR */}
        <div className="flex flex-col gap-6">
          {/* Revenue Trend */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-purple-400">
              📈 Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueTrend}>
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#a855f7"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Retailers */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-green-400">
              🏆 Top Retailers
            </h3>
            <ul className="space-y-3">
              {[
                ...new Set(
                  purchases.map((p) => p.retailerName || p.retailerId)
                ),
              ]
                .slice(0, 3)
                .map((ret, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center bg-[#111]/50 px-4 py-2 rounded-lg hover:bg-green-900/20 transition-all"
                  >
                    <span>{ret}</span>
                    <span className="text-sm text-gray-400">
                      ₹
                      {purchases
                        .filter((p) => (p.retailerName || p.retailerId) === ret)
                        .reduce(
                          (sum, p) =>
                            sum +
                            p.orders.reduce((s, o) => s + o.totalPrice, 0),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">
              🕒 Recent Purchases
            </h3>
            <ul className="space-y-2 text-sm">
              {purchases.slice(0, 5).map((p) => (
                <li
                  key={p._id}
                  className="flex justify-between text-gray-300 hover:text-white transition-all"
                >
                  <span>{p.retailerName || p.retailerId}</span>
                  <span>
                    ₹
                    {p.orders
                      .reduce((s, o) => s + o.totalPrice, 0)
                      .toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllPurchases;
