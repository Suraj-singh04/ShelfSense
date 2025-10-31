import {
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { authorizedFetch } from "../../utils/api";
import { useState } from "react";

const DashboardOverview = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalInventory, setTotalInventory] = useState(0);
  const [totalRetaiers, setTotalRetaiers] = useState(0);

  const fetchRecentProducts = async () => {
    try {
      const res = await authorizedFetch("/api/products/get");
      const data = await res.json();

      const products = data.products;
      setTotalProducts(products.length);
      // console.log("All products count:", products.length);
    } catch (err) {
      console.error("Error fetching recent products:", err);
    }
  };
  fetchRecentProducts();

  const fetchInventory = async () => {
    try {
      const res = await authorizedFetch("/api/inventory/get");
      const data = await res.json();
      // console.log(data);
      const products = data.products;

      const total = products.reduce((sum, item) => sum + item.totalQuantity, 0);
      setTotalInventory(total);
    } catch (err) {
      console.error(err);
    }
  };
  fetchInventory();

  const fetchRetailers = async () => {
    try {
      const res = await authorizedFetch("/api/retailer/get");
      const data = await res.json();
      const retailers = data.retailers;
      setTotalRetaiers(retailers.length);
    } catch (err) {
      console.error("Error fetching recent products:", err);
    }
  };
  fetchRetailers();

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      change: "+12%",
      icon: Package,
      color: "from-purple-500 to-purple-700",
    },
    {
      title: "Total Inventory",
      value: totalInventory,
      change: "+5%",
      icon: ShoppingCart,
      color: "from-green-500 to-green-700",
    },
    {
      title: "Active Retailers",
      value: totalRetaiers,
      change: "+8%",
      icon: Users,
      color: "from-blue-500 to-blue-700",
    },
    {
      title: "Expiring Soon",
      value: 23,
      change: "-3%",
      icon: AlertTriangle,
      color: "from-orange-500 to-red-600",
    },
  ];

  const recentActivity = [
    {
      action: "New product added",
      details: "iPhone 15 Pro added to inventory",
      time: "2 hours ago",
      type: "product",
    },
    {
      action: "Purchase order completed",
      details: "TechMart ordered 50 laptops",
      time: "4 hours ago",
      type: "purchase",
    },
    {
      action: "Low stock alert",
      details: "Organic Milk stock below threshold",
      time: "6 hours ago",
      type: "alert",
    },
    {
      action: "New retailer registered",
      details: "GadgetWorld joined the platform",
      time: "1 day ago",
      type: "retailer",
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "product":
        return <Package className="w-4 h-4 text-purple-400" />;
      case "purchase":
        return <ShoppingCart className="w-4 h-4 text-green-400" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case "retailer":
        return <Users className="w-4 h-4 text-blue-400" />;
      default:
        return <Package className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-900 via-gray-950 to-black min-h-screen text-white">
      {/* Welcome Message */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-green-500 bg-clip-text text-transparent">
          Welcome back, Admin! 👋
        </h1>
        <p className="text-gray-400 text-lg">
          Here’s what’s happening in your dashboard today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-gray-900 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-800"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}
                  >
                    <Icon className="text-white w-6 h-6" />
                  </div>
                  <span className="text-green-400 font-medium">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                <p className="text-gray-400">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 p-6 rounded-2xl shadow border border-gray-800 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-purple-400 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-700/70 transition"
                >
                  <div className="bg-gray-900 shadow-sm p-2 rounded-lg border border-gray-700">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {activity.action}
                    </h4>
                    <p className="text-sm text-gray-400">{activity.details}</p>
                    <span className="text-xs text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions + Alerts */}
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-2xl shadow border border-gray-800">
            <h2 className="text-xl font-semibold text-green-400 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white py-2 px-4 rounded-xl space-x-2 transition transform hover:scale-[1.02]">
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
              <button className="w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white py-2 px-4 rounded-xl space-x-2 transition transform hover:scale-[1.02]">
                <Package className="w-5 h-5" />
                <span>Update Inventory</span>
              </button>
              <button className="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-2 px-4 rounded-xl space-x-2 transition transform hover:scale-[1.02]">
                <Users className="w-5 h-5" />
                <span>View Retailers</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-2xl shadow hover:shadow-xl transition">
            <h2 className="text-xl font-semibold mb-4">⚠️ Urgent Alerts</h2>
            <div className="space-y-3">
              <div className="bg-white bg-opacity-10 p-3 rounded hover:bg-opacity-20 transition">
                <p className="font-medium">5 products expiring this week</p>
                <p className="text-sm text-gray-200">
                  Review purchase suggestions
                </p>
              </div>
              <div className="bg-white bg-opacity-10 p-3 rounded hover:bg-opacity-20 transition">
                <p className="font-medium">Low stock: 12 items</p>
                <p className="text-sm text-gray-200">Restock recommended</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
