import React from "react";

const RetailerInfoCards = () => {
  const retailers = [
    {
      name: "Retailer A",
      id: "RET-001",
      location: "Delhi",
      assignedProducts: 120,
    },
    {
      name: "Retailer B",
      id: "RET-002",
      location: "Mumbai",
      assignedProducts: 85,
    },
    {
      name: "Retailer C",
      id: "RET-003",
      location: "Bangalore",
      assignedProducts: 102,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {retailers.map((retailer, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4"
        >
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100">
            {retailer.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-300">Retailer ID: {retailer.id}</p>
          <p className="text-sm text-gray-500 dark:text-gray-300">Location: {retailer.location}</p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-300 mt-2">
            Assigned Products: {retailer.assignedProducts}
          </p>
        </div>
      ))}
    </div>
  );
};

export default RetailerInfoCards;
