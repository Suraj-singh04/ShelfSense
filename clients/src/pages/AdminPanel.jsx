import React, { useState, useMemo } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Calendar,
  MapPin,
  Eye,
  RefreshCw,
  Zap,
} from "lucide-react";

const SmartInventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [filters, setFilters] = useState({
    productName: "",
    status: "",
    expiryRange: "",
  });

  // Sample data
  const inventoryData = [
    {
      id: 1,
      productName: "Organic Milk",
      batchId: "BT-2024-001",
      quantity: 150,
      expiryDate: "2025-07-15",
      status: "in_inventory",
      assignedRetailer: null,
    },
    {
      id: 2,
      productName: "Fresh Bread",
      batchId: "BT-2024-002",
      quantity: 80,
      expiryDate: "2025-07-13",
      status: "assigned",
      assignedRetailer: "Green Mart",
    },
    {
      id: 3,
      productName: "Antibiotics",
      batchId: "BT-2024-003",
      quantity: 25,
      expiryDate: "2025-07-12",
      status: "in_inventory",
      assignedRetailer: null,
    },
    {
      id: 4,
      productName: "Yogurt",
      batchId: "BT-2024-004",
      quantity: 0,
      expiryDate: "2025-07-10",
      status: "expired",
      assignedRetailer: null,
    },
  ];

  const productsData = [
    {
      id: 1,
      name: "Organic Milk",
      category: "Dairy",
      batches: 3,
      recentBatches: ["BT-2024-001", "BT-2024-005"],
      nearestExpiry: "2025-07-15",
    },
    {
      id: 2,
      name: "Fresh Bread",
      category: "Bakery",
      batches: 2,
      recentBatches: ["BT-2024-002", "BT-2024-006"],
      nearestExpiry: "2025-07-13",
    },
    {
      id: 3,
      name: "Antibiotics",
      category: "Medicine",
      batches: 1,
      recentBatches: ["BT-2024-003"],
      nearestExpiry: "2025-07-12",
    },
  ];

  const retailersData = [
    {
      id: 1,
      name: "Green Mart",
      location: "Downtown",
      salesVolume: 15420,
      productsCount: 45,
    },
    {
      id: 2,
      name: "FreshCo",
      location: "Suburbs",
      salesVolume: 12350,
      productsCount: 38,
    },
    {
      id: 3,
      name: "MediPlus Pharmacy",
      location: "City Center",
      salesVolume: 8750,
      productsCount: 22,
    },
  ];

  const routingLogsData = [
    {
      id: 1,
      product: "Organic Milk - BT-2024-001",
      retailer: "Green Mart",
      status: "confirmed",
      date: "2025-07-11",
      confidence: 95,
    },
    {
      id: 2,
      product: "Fresh Bread - BT-2024-002",
      retailer: "FreshCo",
      status: "pending",
      date: "2025-07-11",
      confidence: 87,
    },
    {
      id: 3,
      product: "Antibiotics - BT-2024-003",
      retailer: "MediPlus Pharmacy",
      status: "rejected",
      date: "2025-07-10",
      confidence: 72,
    },
  ];

  // Helper functions
  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "in_inventory":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "assigned":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "expired":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "in_inventory":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter inventory data
  const filteredInventory = useMemo(() => {
    return inventoryData.filter((item) => {
      const matchesName = item.productName
        .toLowerCase()
        .includes(filters.productName.toLowerCase());
      const matchesStatus = !filters.status || item.status === filters.status;

      let matchesExpiry = true;
      if (filters.expiryRange) {
        const days = getDaysUntilExpiry(item.expiryDate);
        if (filters.expiryRange === "expiring_soon") {
          matchesExpiry = days <= 10;
        } else if (filters.expiryRange === "expired") {
          matchesExpiry = days < 0;
        }
      }

      return matchesName && matchesStatus && matchesExpiry;
    });
  }, [filters]);

  // Summary metrics
  const metrics = {
    totalProducts: productsData.length,
    totalInventory: inventoryData.reduce((sum, item) => sum + item.quantity, 0),
    expiringSoon: inventoryData.filter(
      (item) =>
        getDaysUntilExpiry(item.expiryDate) <= 10 &&
        getDaysUntilExpiry(item.expiryDate) > 0
    ).length,
    assignedToRetailers: inventoryData.filter(
      (item) => item.status === "assigned"
    ).length,
    rejectedSuggestions: routingLogsData.filter(
      (log) => log.status === "rejected"
    ).length,
  };

  const openModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setModalType("");
  };

  const renderModal = () => {
    if (!showAddModal) return null;

    const modalContent = {
      inventory: {
        title: "Add New Inventory",
        fields: ["Product Name", "Batch ID", "Quantity", "Expiry Date"],
      },
      product: {
        title: "Add New Product",
        fields: ["Product Name", "Category", "Description"],
      },
      retailer: {
        title: "Add New Retailer",
        fields: ["Retailer Name", "Location", "Contact Email", "Phone"],
      },
    };

    const content = modalContent[modalType];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">{content.title}</h3>
          <div className="space-y-4">
            {content.fields.map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium mb-1">
                  {field}
                </label>
                <input
                  type={
                    field.includes("Date")
                      ? "date"
                      : field.includes("Quantity")
                      ? "number"
                      : "text"
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${field.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add {modalType}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Smart Inventory Routing System
          </h1>
          <p className="text-gray-600">Admin Dashboard</p>
        </div>
      </header>

      {/* Summary Metrics */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.totalProducts}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Inventory</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.totalInventory}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">
                  {metrics.expiringSoon}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assigned Units</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.assignedToRetailers}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected Suggestions</p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics.rejectedSuggestions}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                {
                  id: "inventory",
                  label: "Inventory Management",
                  icon: Package,
                },
                {
                  id: "products",
                  label: "Product Management",
                  icon: ShoppingCart,
                },
                { id: "retailers", label: "Retailer Management", icon: Users },
                { id: "routing", label: "Smart Routing Logs", icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "inventory" && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        value={filters.productName}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            productName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <select
                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                    >
                      <option value="">All Status</option>
                      <option value="in_inventory">In Inventory</option>
                      <option value="assigned">Assigned</option>
                      <option value="expired">Expired</option>
                    </select>
                    <select
                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      value={filters.expiryRange}
                      onChange={(e) =>
                        setFilters({ ...filters, expiryRange: e.target.value })
                      }
                    >
                      <option value="">All Expiry</option>
                      <option value="expiring_soon">Expiring Soon</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  <button
                    onClick={() => openModal("inventory")}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Inventory</span>
                  </button>
                </div>

                {/* Inventory Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 font-medium text-gray-700">
                          Product Name
                        </th>
                        <th className="text-left p-3 font-medium text-gray-700">
                          Batch ID
                        </th>
                        <th className="text-left p-3 font-medium text-gray-700">
                          Quantity
                        </th>
                        <th className="text-left p-3 font-medium text-gray-700">
                          Expiry Date
                        </th>
                        <th className="text-left p-3 font-medium text-gray-700">
                          Status
                        </th>
                        <th className="text-left p-3 font-medium text-gray-700">
                          Assigned Retailer
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item) => {
                        const daysUntilExpiry = getDaysUntilExpiry(
                          item.expiryDate
                        );
                        const isExpiringSoon =
                          daysUntilExpiry <= 10 && daysUntilExpiry > 0;

                        return (
                          <tr
                            key={item.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-3 font-medium">
                              {item.productName}
                            </td>
                            <td className="p-3 text-gray-600">
                              {item.batchId}
                            </td>
                            <td className="p-3">{item.quantity}</td>
                            <td
                              className={`p-3 ${
                                isExpiringSoon
                                  ? "text-orange-600 font-medium"
                                  : "text-gray-600"
                              }`}
                            >
                              {item.expiryDate}
                              {isExpiringSoon && (
                                <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                  {daysUntilExpiry} days
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${getStatusColor(
                                  item.status
                                )}`}
                              >
                                {getStatusIcon(item.status)}
                                <span className="capitalize">
                                  {item.status.replace("_", " ")}
                                </span>
                              </span>
                            </td>
                            <td className="p-3 text-gray-600">
                              {item.assignedRetailer || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Product Management</h3>
                  <button
                    onClick={() => openModal("product")}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsData.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {product.category}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {product.batches} batches
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">
                            Recent Batches:
                          </p>
                          <p className="text-sm font-mono">
                            {product.recentBatches.join(", ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Nearest Expiry:
                          </p>
                          <p className="text-sm">{product.nearestExpiry}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "retailers" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Retailer Management</h3>
                  <button
                    onClick={() => openModal("retailer")}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Retailer</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {retailersData.map((retailer) => (
                    <div
                      key={retailer.id}
                      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {retailer.name}
                          </h4>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {retailer.location}
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Sales Volume:
                          </span>
                          <span className="text-sm font-medium">
                            ${retailer.salesVolume.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Products:
                          </span>
                          <span className="text-sm font-medium">
                            {retailer.productsCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "routing" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Smart Routing Logs</h3>
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                      <Zap className="w-4 h-4" />
                      <span>Run Smart Suggestion</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                      <RefreshCw className="w-4 h-4" />
                      <span>Run Fallback Handler</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 font-medium text-gray-700">
                          Product
                        </th>
                        <th className="text-left p-3 font-medium text-gray-700">
                          Suggested Retailer
                        </th>
                        <th className="text-left p-3 font-medium text-gray-700">
                          Status
                        </th>
                        <th className="text-left p-3 font-medium text-gray-700">
                          Confidence
                        </th>
                        <th className="text-left p-3 font-medium text-gray-700">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {routingLogsData.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{log.product}</td>
                          <td className="p-3 text-gray-600">{log.retailer}</td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs ${getStatusColor(
                                log.status
                              )}`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${log.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {log.confidence}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-gray-600">{log.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default SmartInventoryDashboard;
