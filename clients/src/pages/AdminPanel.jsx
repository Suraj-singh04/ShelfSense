import React, { useState, useEffect } from "react";
import {
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaPlus,
  FaFilter,
  FaSearch,
  FaChartBar,
  FaCalendar,
  FaMapMarkerAlt,
  FaEye,
  FaSync,
  FaBolt,
  FaSpinner
} from "react-icons/fa";
import { adminAPI } from "../api";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data states
  const [inventoryData, setInventoryData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [suggestionsData, setSuggestionsData] = useState([]);

  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    batches: [{ batchId: "", expiryDate: "" }]
  });

  const [inventoryForm, setInventoryForm] = useState({
    productName: "",
    quantity: "",
    batchId: "",
    expiryDate: ""
  });

  // Filters
  const [filters, setFilters] = useState({
    productName: "",
    status: "",
    expiryRange: "",
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load inventory data
      const inventoryResponse = await adminAPI.getAllInventory();
      if (inventoryResponse.success) {
        setInventoryData(inventoryResponse.data.products || []);
      }

      // Load products data
      const productsResponse = await adminAPI.getAllProducts();
      if (productsResponse.success) {
        setProductsData(productsResponse.data.products || []);
      }

      // Load suggestions data (if endpoint exists)
      try {
        const suggestionsResponse = await adminAPI.getAllSuggestions();
        if (suggestionsResponse.success) {
          setSuggestionsData(suggestionsResponse.data || []);
        }
      } catch (err) {
        console.log("Suggestions endpoint not available yet");
      }

    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

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
        return <FaBox className="w-4 h-4 text-blue-500" />;
      case "assigned":
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case "expired":
        return <FaTimesCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FaClock className="w-4 h-4 text-gray-500" />;
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
  const filteredInventory = inventoryData.filter((item) => {
    const matchesName = item.productName
      ? item.productName.toLowerCase().includes(filters.productName.toLowerCase())
      : true;
    const matchesStatus = !filters.status || item.currentStatus === filters.status;

    let matchesExpiry = true;
    if (filters.expiryRange && item.expiryDate) {
      const days = getDaysUntilExpiry(item.expiryDate);
      if (filters.expiryRange === "expiring_soon") {
        matchesExpiry = days <= 10;
      } else if (filters.expiryRange === "expired") {
        matchesExpiry = days < 0;
      }
    }

    return matchesName && matchesStatus && matchesExpiry;
  });

  // Summary metrics
  const metrics = {
    totalProducts: productsData.length,
    totalInventory: inventoryData.reduce((sum, item) => sum + (item.quantity || 0), 0),
    expiringSoon: inventoryData.filter(
      (item) =>
        item.expiryDate &&
        getDaysUntilExpiry(item.expiryDate) <= 10 &&
        getDaysUntilExpiry(item.expiryDate) > 0
    ).length,
    assignedToRetailers: inventoryData.filter(
      (item) => item.currentStatus === "assigned"
    ).length,
    rejectedSuggestions: suggestionsData.filter(
      (log) => log.status === "rejected"
    ).length,
  };

  // Modal functions
  const openModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setModalType("");
    setProductForm({ name: "", category: "", batches: [{ batchId: "", expiryDate: "" }] });
    setInventoryForm({ productName: "", quantity: "", batchId: "", expiryDate: "" });
  };

  // Form handlers
  const handleProductFormChange = (field, value) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  };

  const handleInventoryFormChange = (field, value) => {
    setInventoryForm(prev => ({ ...prev, [field]: value }));
  };

  const addBatchToProduct = () => {
    setProductForm(prev => ({
      ...prev,
      batches: [...prev.batches, { batchId: "", expiryDate: "" }]
    }));
  };

  const removeBatchFromProduct = (index) => {
    setProductForm(prev => ({
      ...prev,
      batches: prev.batches.filter((_, i) => i !== index)
    }));
  };

  const updateBatch = (index, field, value) => {
    setProductForm(prev => ({
      ...prev,
      batches: prev.batches.map((batch, i) =>
        i === index ? { ...batch, [field]: value } : batch
      )
    }));
  };

  // Submit handlers
  const handleAddProduct = async () => {
    try {
      const response = await adminAPI.addProduct(productForm);
      if (response.success) {
        closeModal();
        loadData(); // Reload data
        alert("Product added successfully!");
      } else {
        alert("Failed to add product: " + response.error);
      }
    } catch (error) {
      alert("Error adding product: " + error.message);
    }
  };

  const handleAddInventory = async () => {
    try {
      const response = await adminAPI.addInventoryItem(inventoryForm);
      if (response.success) {
        closeModal();
        loadData(); // Reload data
        alert("Inventory item added successfully!");
      } else {
        alert("Failed to add inventory item: " + response.error);
      }
    } catch (error) {
      alert("Error adding inventory item: " + error.message);
    }
  };

  const renderModal = () => {
    if (!showAddModal) return null;

    if (modalType === "product") {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => handleProductFormChange('name', e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={productForm.category}
                  onChange={(e) => handleProductFormChange('category', e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Batches</label>
                {productForm.batches.map((batch, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={batch.batchId}
                      onChange={(e) => updateBatch(index, 'batchId', e.target.value)}
                      className="flex-1 p-2 border rounded-md"
                      placeholder="Batch ID"
                    />
                    <input
                      type="date"
                      value={batch.expiryDate}
                      onChange={(e) => updateBatch(index, 'expiryDate', e.target.value)}
                      className="flex-1 p-2 border rounded-md"
                    />
                    <button
                      onClick={() => removeBatchFromProduct(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addBatchToProduct}
                  className="w-full p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Add Batch
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modalType === "inventory") {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Inventory Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <select
                  value={inventoryForm.productName}
                  onChange={(e) => handleInventoryFormChange('productName', e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Product</option>
                  {productsData.map((product) => (
                    <option key={product._id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  value={inventoryForm.quantity}
                  onChange={(e) => handleInventoryFormChange('quantity', e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Batch ID</label>
                <input
                  type="text"
                  value={inventoryForm.batchId}
                  onChange={(e) => handleInventoryFormChange('batchId', e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter batch ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={inventoryForm.expiryDate}
                  onChange={(e) => handleInventoryFormChange('expiryDate', e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInventory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Inventory Item
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
          <span className="text-lg">Loading admin panel...</span>
        </div>
      </div>
    );
  }

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

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

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
              <FaBox className="w-8 h-8 text-blue-500" />
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
              <FaChartBar className="w-8 h-8 text-green-500" />
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
              <FaExclamationTriangle className="w-8 h-8 text-orange-500" />
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
              <FaCheckCircle className="w-8 h-8 text-green-500" />
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
              <FaTimesCircle className="w-8 h-8 text-red-500" />
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
                  icon: FaBox,
                },
                {
                  id: "products",
                  label: "Product Management",
                  icon: FaShoppingCart,
                },
                { id: "retailers", label: "Retailer Management", icon: FaUsers },
                { id: "routing", label: "Smart Routing Logs", icon: FaChartLine },
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
                      <FaSearch className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
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
                    <FaPlus className="w-4 h-4" />
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
                      {filteredInventory.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-gray-500">
                            No inventory items found
                          </td>
                        </tr>
                      ) : (
                        filteredInventory.map((item, index) => {
                          const daysUntilExpiry = item.expiryDate ? getDaysUntilExpiry(item.expiryDate) : null;
                          const isExpiringSoon = daysUntilExpiry && daysUntilExpiry <= 10 && daysUntilExpiry > 0;

                          return (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-medium">
                                {item.productName || "Unknown"}
                              </td>
                              <td className="p-3 text-gray-600">
                                {item.batchId || "N/A"}
                              </td>
                              <td className="p-3">{item.quantity || 0}</td>
                              <td className={`p-3 ${isExpiringSoon ? "text-orange-600 font-medium" : "text-gray-600"}`}>
                                {item.expiryDate ? (
                                  <>
                                    {item.expiryDate}
                                    {isExpiringSoon && (
                                      <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                        {daysUntilExpiry} days
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  "N/A"
                                )}
                              </td>
                              <td className="p-3">
                                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${getStatusColor(item.currentStatus)}`}>
                                  {getStatusIcon(item.currentStatus)}
                                  <span className="capitalize">
                                    {item.currentStatus ? item.currentStatus.replace("_", " ") : "Unknown"}
                                  </span>
                                </span>
                              </td>
                              <td className="p-3 text-gray-600">
                                {item.assignedRetailer || "-"}
                              </td>
                            </tr>
                          );
                        })
                      )}
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
                    <FaPlus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsData.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No products found
                    </div>
                  ) : (
                    productsData.map((product) => (
                      <div
                        key={product._id}
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
                            {product.batches ? product.batches.length : 0} batches
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">
                              Recent Batches:
                            </p>
                            <p className="text-sm font-mono">
                              {product.batches && product.batches.length > 0
                                ? product.batches.slice(0, 2).map(b => b.batchId).join(", ")
                                : "No batches"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Nearest Expiry:
                            </p>
                            <p className="text-sm">
                              {product.batches && product.batches.length > 0
                                ? product.batches[0].expiryDate
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "retailers" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Retailer Management</h3>
                  <div className="text-gray-500">Coming soon...</div>
                </div>
                <div className="text-center py-8 text-gray-500">
                  Retailer management features will be available soon
                </div>
              </div>
            )}

            {activeTab === "routing" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Smart Routing Logs</h3>
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                      <FaBolt className="w-4 h-4" />
                      <span>Run Smart Suggestion</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                      <FaSync className="w-4 h-4" />
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
                      {suggestionsData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-gray-500">
                            No routing logs found
                          </td>
                        </tr>
                      ) : (
                        suggestionsData.map((log, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{log.product || "Unknown"}</td>
                            <td className="p-3 text-gray-600">{log.retailer || "Unknown"}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getStatusColor(log.status)}`}>
                                {log.status || "Unknown"}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${log.confidence || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">
                                  {log.confidence || 0}%
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-gray-600">{log.date || "N/A"}</td>
                          </tr>
                        ))
                      )}
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

export default AdminPanel;
