import React from "react";

const StatusCards = () => {
  const stats = [
    {
      title: "Total Sales",
      value: "₹45,000",
      bg: "bg-blue-500",
    },
    {
      title: "Total Products",
      value: "120",
      bg: "bg-green-500",
    },
    {
      title: "Active Retailers",
      value: "8",
      bg: "bg-yellow-500",
    },
    {
      title: "Unresolved Stocks",
      value: "15",
      bg: "bg-red-500",
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-4 rounded-2xl shadow-md text-white ${stat.bg}`}
        >
          <h3 className="text-sm font-medium">{stat.title}</h3>
          <p className="text-2xl font-bold">{stat.value}</p>
        </div>
      ))}
    </>
  );
};

export default StatusCards;
