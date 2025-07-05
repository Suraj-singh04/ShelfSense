import React from "react";
import { FaChartBar, FaBoxOpen, FaCog, FaSignOutAlt, FaPlus, FaStore } from "react-icons/fa";

const Sidebar = () => {
return (
<div className="bg-teal-600 text-white min-h-screen w-64 p-4 flex flex-col justify-between">
<div>
<h1 className="text-2xl font-bold mb-8 text-center">Retailer</h1>
<nav className="space-y-2">
<button className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-teal-700">
<FaChartBar />
<span>Overview</span>
</button>
<button className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-teal-700">
<FaStore />
<span>Performance</span>
</button>
<button className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-teal-700">
<FaBoxOpen />
<span>Inventory</span>
</button>
<button className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-teal-700">
<FaChartBar />
<span>Stock Overview</span>
</button>
<button className="flex items-center space-x-2 w-full px-3 py-2 rounded bg-white text-black">
<FaChartBar />
<span>Sales Metrics</span>
</button>
<button className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-teal-700">
<FaCog />
<span>Settings</span>
</button>
</nav>
</div>
<div className="space-y-2">
<button className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-teal-700">
<FaPlus />
<span>Add Product</span>
</button>
<button className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-teal-700">
<FaSignOutAlt />
<span>Log Out</span>
</button>
</div>
</div>
);
};

export default Sidebar;