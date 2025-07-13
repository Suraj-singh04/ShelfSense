import React from "react";

const RetailerHeader = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md rounded-2xl px-6 py-4 flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
          👋 Welcome, Retailer
        </h1>
        <p className="text-gray-500 dark:text-gray-300 text-sm sm:text-base mt-1">
          Here’s your dashboard overview 🛒
        </p>
      </div>
      <img
        src="https://avatars.githubusercontent.com/u/1?v=4"
        alt="Retailer Avatar"
        className="w-16 h-16 rounded-full mt-4 sm:mt-0"
      />
    </header>
  );
};

export default RetailerHeader;
