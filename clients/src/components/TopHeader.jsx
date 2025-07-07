import React, { useState, useEffect } from "react";

const TopHeader = () => {
const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
document.documentElement.classList.toggle("dark", darkMode);
}, [darkMode]);

const toggleDarkMode = () => {
setDarkMode(!darkMode);
};

return (
<div className="flex justify-between items-center p-4 border-b bg-white dark:bg-gray-800">
<div>
<h2 className="text-xl font-semibold text-gray-800 dark:text-white">Current Metrics</h2>
<div className="text-sm text-gray-500">Select date range: <span className="font-medium">Current Month</span></div>
</div>
<div className="flex items-center gap-4">
<button className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-sm" onClick={toggleDarkMode} >
{darkMode ? "🌙 Dark" : "☀️ Light"}
</button>
<button className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600" />
</div>
</div>
);
};

export default TopHeader;