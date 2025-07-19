import {
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Plus,
} from "lucide-react";

const DashboardOverview = () => {
  const stats = [
    {
      title: "Total Products",
      value: "1,247",
      change: "+12%",
      icon: Package,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    {
      title: "Total Inventory",
      value: "8,543",
      change: "+5%",
      icon: ShoppingCart,
      color: "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      title: "Active Retailers",
      value: "156",
      change: "+8%",
      icon: Users,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
    {
      title: "Expiring Soon",
      value: "23",
      change: "-3%",
      icon: AlertTriangle,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
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
        return <Package className="w-4 h-4 text-blue-500" />;
      case "purchase":
        return <ShoppingCart className="w-4 h-4 text-green-500" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "retailer":
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome back, Admin! 👋
        </h1>
        <p className="text-gray-600 text-lg">
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
              className="bg-white rounded-2xl shadow hover:shadow-md transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="text-white w-6 h-6" />
                  </div>
                  <span className="text-green-600 font-medium">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </h3>
                <p className="text-gray-500">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg hover:bg-gray-100"
                >
                  <div className="bg-white shadow-sm p-2 rounded">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">
                      {activity.action}
                    </h4>
                    <p className="text-sm text-gray-500">{activity.details}</p>
                    <span className="text-xs text-gray-400">
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
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
              <button className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl space-x-2">
                <Package className="w-5 h-5" />
                <span>Update Inventory</span>
              </button>
              <button className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-xl space-x-2">
                <Users className="w-5 h-5" />
                <span>View Retailers</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">⚠️ Urgent Alerts</h2>
            <div className="space-y-3">
              <div className="bg-white bg-opacity-20 p-3 rounded">
                <p className="font-medium">5 products expiring this week</p>
                <p className="text-sm">Review purchase suggestions</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded">
                <p className="font-medium">Low stock: 12 items</p>
                <p className="text-sm">Restock recommended</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
