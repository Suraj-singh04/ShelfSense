const PurchaseSuggestions = () => {
  const expiringProducts = [
    {
      id: 1,
      name: "Organic Milk",
      currentStock: 25,
      expiryDate: "2024-07-25",
      daysLeft: 7,
      suggestedOrder: 50,
      supplier: "Dairy Farm Co.",
    },
    {
      id: 2,
      name: "Fresh Bread",
      currentStock: 15,
      expiryDate: "2024-07-22",
      daysLeft: 4,
      suggestedOrder: 30,
      supplier: "Bakery Plus",
    },
    {
      id: 3,
      name: "Yogurt Cups",
      currentStock: 40,
      expiryDate: "2024-07-28",
      daysLeft: 10,
      suggestedOrder: 60,
      supplier: "Dairy Farm Co.",
    },
    {
      id: 4,
      name: "Salad Mix",
      currentStock: 8,
      expiryDate: "2024-07-21",
      daysLeft: 3,
      suggestedOrder: 25,
      supplier: "Green Vegetables Ltd.",
    },
    {
      id: 5,
      name: "Chicken Breast",
      currentStock: 12,
      expiryDate: "2024-07-24",
      daysLeft: 6,
      suggestedOrder: 20,
      supplier: "Meat Masters",
    },
  ];

  const getPriorityColor = (daysLeft) => {
    if (daysLeft <= 3) return "bg-red-100 text-red-800 border-red-200";
    if (daysLeft <= 7) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const getPriorityText = (daysLeft) => {
    if (daysLeft <= 3) return "Critical";
    if (daysLeft <= 7) return "High";
    return "Medium";
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Purchase Suggestions - Expiring Products
      </h2>
      <div className="space-y-4">
        {expiringProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-400"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Supplier: {product.supplier}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                  product.daysLeft
                )}`}
              >
                {getPriorityText(product.daysLeft)} Priority
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-lg font-semibold text-gray-800">
                  {product.currentStock} units
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expiry Date</p>
                <p className="text-lg font-semibold text-gray-800">
                  {product.expiryDate}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Left</p>
                <p className="text-lg font-semibold text-red-600">
                  {product.daysLeft} days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Suggested Order</p>
                <p className="text-lg font-semibold text-green-600">
                  {product.suggestedOrder} units
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                Create Purchase Order
              </button>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm">
                Contact Supplier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseSuggestions;
