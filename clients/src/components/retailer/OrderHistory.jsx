import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { authorizedFetch } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await authorizedFetch("/api/retailer/orders");
        const result = await res.json();
        console.log("Fetched result:", result);

        if (result.success && Array.isArray(result.orders)) {
          setOrders(result.orders);
        } else {
          setOrders([]);
          setError("⚠️ No orders found.");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("❌ Failed to load orders. Please try again later.");
      }
    };

    if (user) fetchOrders();
  }, [user]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Order History</h2>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>

        {orders.length === 0 ? (
          <div className="p-6 text-gray-600 text-sm text-center">
            No orders available.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map((order, index) => (
              <div
                key={index}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.productName}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {new Date(order.purchasedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">
                      Quantity: {order.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{order.totalPrice.toFixed(2)}
                    </p>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
