import React from "react";

const TopHeader = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 shadow-sm">
      <h1 className="text-2xl font-bold">ShelfSense Admin</h1>
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
        >
          {darkMode ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
    </div>
  );
};

export default TopHeader;
