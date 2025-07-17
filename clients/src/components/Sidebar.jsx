import React from "react";
import {
  FaChartBar,
  FaStore,
  FaBoxOpen,
  FaCog,
  FaSignOutAlt,
  FaUserShield,
} from "react-icons/fa";
import SidebarItem from "./SidebarItem";

const Sidebar = ({ children }) => (
  <aside className="w-64 bg-white dark:bg-gray-800 p-6 shadow-md">
    <h1 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
      🧾 Retailer Panel
    </h1>
    {children}
  </aside>
);

export default Sidebar;
