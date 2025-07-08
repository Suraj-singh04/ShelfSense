import React from "react";
import { FaChartBar, FaBoxOpen, FaCog, FaSignOutAlt, FaPlus, FaStore } from "react-icons/fa";

const SidebarItem = ({ icon, label }) => (
  <div className="flex items-center space-x-2 px-4 py-2 hover:bg-teal-700 rounded cursor-pointer">
    <span className="text-lg">{icon}</span>
    <span className="text-sm">{label}</span>
  </div>
);

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-teal-600 text-white flex flex-col justify-between shadow-lg z-50">
      
      {/* Top Menu */}
      <div className="flex-grow overflow-y-auto">
        <div className="p-4 space-y-2">
          <SidebarItem icon={<FaChartBar />} label="Overview" />
          <SidebarItem icon={<FaChartBar />} label="Performance" />
          <SidebarItem icon={<FaStore />} label="Inventory" />
          <SidebarItem icon={<FaBoxOpen />} label="Stock Overview" />
          <SidebarItem icon={<FaCog />} label="Settings" />
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="p-4 space-y-2">
        <SidebarItem icon={<FaPlus />} label="Add Product" />
        <SidebarItem icon={<FaSignOutAlt />} label="Log Out" />
      </div>
    </div>
  );
};

export default Sidebar;
