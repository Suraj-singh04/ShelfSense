import React from "react";
import { Link, useLocation } from "react-router-dom";

const SidebarItem = ({ icon, label, route }) => {
  const location = useLocation();
  const isActive = location.pathname === route;

  return (
    <Link to={route}>
      <div
        className={`flex items-center space-x-2 px-4 py-2 rounded cursor-pointer ${
          isActive ? "bg-teal-700 font-semibold" : "hover:bg-teal-500"
        }`}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
    </Link>
  );
};

export default SidebarItem;
