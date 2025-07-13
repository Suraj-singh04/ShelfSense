import React from "react";
import {
  FaChartBar,
  FaStore,
  FaBoxOpen,
  FaCog,
  FaPlus,
  FaSignOutAlt,
  FaUserTie,
} from "react-icons/fa";
import SidebarItem from "./SidebarItem";

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-teal-600 text-white z-50 shadow-lg">
      <div className="flex items-center justify-center h-16 bg-teal-700">
        <h1 className="text-2xl font-bold">Retailer Dashboard</h1>
      </div>
      <div className="flex-grow overflow-y-auto">
        <div className="p-4 space-y-2">
          <SidebarItem icon={<FaChartBar />} label="Overview" route="/" />
          <SidebarItem icon={<FaUserTie />} label="Retailer Panel" route="/retailer-dashboard" />
          <SidebarItem icon={<FaBoxOpen />} label="Stock Overview" route="/stock-overview" />
          <SidebarItem icon={<FaCog />} label="Settings" route="/settings" />
        </div>
      </div>
      <div className="p-4 space-y-2">
        <SidebarItem icon={<FaPlus />} label="Add Product" route="/add-product" />
        <SidebarItem icon={<FaSignOutAlt />} label="Log Out" route="/logout" />
      </div>
    </div>
  );
};

export default Sidebar;
