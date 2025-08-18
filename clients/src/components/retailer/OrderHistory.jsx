import { useEffect, useState } from "react";
import { authorizedFetch } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrdersAndInventory = async () => {
      try {
        // Fetch inventory (for product images)
        const inventoryRes = await authorizedFetch("/api/inventory/get");
        const inventoryData = await inventoryRes.json();

        let inventoryList = [];
        if (inventoryData.success && Array.isArray(inventoryData.products)) {
          inventoryList = inventoryData.products;
          setInventory(inventoryList);
        }

        const purchasesRes = await authorizedFetch("/api/purchase/get");
        const purchasesData = await purchasesRes.json();

        if (purchasesData.success && Array.isArray(purchasesData.purchases)) {
          // ✅ Backend already filters by retailer/admin, so no need to filter again
          const mergedOrders = purchasesData.purchases.map((purchase) => ({
            ...purchase,
            orders: purchase.orders.map((item) => {
              const productInfo = inventoryList.find(
                (p) =>
                  p.productId === item.productId || p._id === item.productId
              );
              return {
                ...item,
                imageUrl: productInfo?.imageUrl || "/placeholder.png",
              };
            }),
          }));

          setOrders(mergedOrders);
        } else {
          setError("⚠️ No orders found.");
        }
      } catch (err) {
        console.error(err);
        setError("❌ Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrdersAndInventory();
  }, [user]);

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((o) =>
          o.orders.some(
            (item) =>
              item.status && item.status.toLowerCase() === filter.toLowerCase()
          )
        );

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Order History</h2>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
        {["All", "Pending", "Completed", "Cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 text-sm font-medium transition-all ${
              filter === tab
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length === 0 && (
        <div className="p-10 text-gray-600 text-center text-lg">
          No {filter !== "All" ? filter : ""} orders found.
        </div>
      )}

      <div className="space-y-6">
        {filteredOrders.map((order) =>
          order.orders.map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-xl border border-gray-100 p-6 hover:shadow-lg transition duration-300"
            >
              <div className="flex items-center gap-6">
                {/* Product Image */}
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded-lg border"
                />

                {/* Order Info */}
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900">
                    {item.productName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Order No: <span className="font-medium">{order._id}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Placed: {new Date(order.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Qty: <span className="font-medium">{item.quantity}</span>
                  </p>
                </div>

                {/* Price + Status */}
                <div className="text-right space-y-2">
                  <p className="text-lg font-bold text-gray-900">
                    ₹{item.totalPrice.toFixed(2)}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : item.status === "Pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.status || "Pending"}
                  </span>
                  <div>
                    {item.status === "Cancelled" ? (
                      <button className="mt-2 px-4 py-1 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
                        Buy Again
                      </button>
                    ) : (
                      <button className="mt-2 px-4 py-1 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                        View Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
