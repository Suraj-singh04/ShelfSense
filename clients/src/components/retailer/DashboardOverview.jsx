import React, { useState, useEffect } from "react";
import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DashboardOverview = () => {
  const [stats, setStats] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [dailySales, setDailySales] = useState([]);

  // Simulate fetching from API
  useEffect(() => {
    // Example: Replace these with real API calls
    const fetchDashboardData = async () => {
      try {
        // Simulated delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Fake fetched data
        setStats([
          {
            title: "Total Sales",
            value: "$28,500",
            change: "+12%",
            icon: DollarSign,
            color: "bg-green-500",
          },
          {
            title: "Total Orders",
            value: "156",
            change: "+8%",
            icon: ShoppingBag,
            color: "bg-blue-500",
          },
          {
            title: "Products",
            value: "1,234",
            change: "+3%",
            icon: Package,
            color: "bg-purple-500",
          },
          {
            title: "Revenue Growth",
            value: "15.3%",
            change: "+2.1%",
            icon: TrendingUp,
            color: "bg-orange-500",
          },
        ]);

        setSalesData([
          { month: "Jan", sales: 4000, purchases: 2400 },
          { month: "Feb", sales: 3000, purchases: 1398 },
          { month: "Mar", sales: 5000, purchases: 3800 },
          { month: "Apr", sales: 4500, purchases: 3908 },
          { month: "May", sales: 6000, purchases: 4800 },
          { month: "Jun", sales: 5500, purchases: 3800 },
        ]);

        setCategoryData([
          { name: "Electronics", value: 400, color: "#8884d8" },
          { name: "Clothing", value: 300, color: "#82ca9d" },
          { name: "Food", value: 200, color: "#ffc658" },
          { name: "Books", value: 100, color: "#ff7300" },
        ]);

        setDailySales([
          {
            id: 1,
            date: "2025-07-19",
            product: "Smartphone X1",
            quantity: 2,
            amount: 1198,
          },
          {
            id: 2,
            date: "2025-07-19",
            product: "Coffee Beans",
            quantity: 5,
            amount: 75,
          },
          {
            id: 3,
            date: "2025-07-18",
            product: "Designer Jeans",
            quantity: 3,
            amount: 267,
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-green-600 text-sm mt-1 font-medium">
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Sales vs Purchases Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="purchases"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Recent Sales Activity
        </h3>
        <div className="space-y-3">
          {dailySales.slice(0, 3).map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{sale.product}</p>
                <p className="text-sm text-gray-600">{sale.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${sale.amount}</p>
                <p className="text-sm text-gray-600">Qty: {sale.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
