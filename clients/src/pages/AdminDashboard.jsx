import { useState, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import DashboardOverview from "../components/admin/DashboardOverview";
import AddProducts from "../components/admin/AddProducts";
import AddInventory from "../components/admin/AddInventory";
import Purchases from "../components/admin/Purchases";
import RetailerDetails from "../components/admin/RetailerDetails";
import Suggestions from "../components/admin/Suggestions";
import { authorizedFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext"; // 

const navItems = [
  { name: "Dashboard", path: "", icon: "📊" },
  { name: "Add Products", path: "add-products", icon: "➕" },
  { name: "Add Inventory", path: "add-inventory", icon: "📦" },
  { name: "Purchases", path: "purchases", icon: "🛒" },
  { name: "Retailers", path: "retailers", icon: "👥" },
  { name: "Suggestions", path: "suggestions", icon: "💡" },
];

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isActive = (path) => {
    const fullPath = `/admin-dashboard/${path}`;
    return (
      location.pathname === fullPath ||
      (path === "" && location.pathname === "/admin-dashboard")
    );
  };

  const [productList, setProductList] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await authorizedFetch("/api/products/get");
      const data = await res.json();
      if (res.ok) setProductList(data.products || []);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await authorizedFetch("/api/inventory/get");
      const data = await res.json();
      if (res.ok) setInventoryData(data.products || []);
    } catch (err) {
      console.error("❌ Error fetching inventory:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchInventory();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex bg-[#f9fafb]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white w-64 p-6 border-r shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-indigo-600">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-600 hover:text-red-500 text-2xl"
          >
            <IoMdClose />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={`/admin-dashboard/${item.path}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 mt-6 text-red-600 hover:text-white hover:bg-gradient-to-r from-red-500 to-pink-500 rounded-xl transition-all duration-200"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Backdrop on small screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen md:ml-64 overflow-y-auto p-4 md:p-8 bg-[#f9fafb]">
        {/* Mobile hamburger */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-2xl text-gray-800"
          >
            <GiHamburgerMenu />
          </button>
        </div>

        <Routes>
          <Route index element={<DashboardOverview />} />
          <Route
            path="add-products"
            element={<AddProducts onProductAdded={fetchProducts} />}
          />
          <Route
            path="add-inventory"
            element={
              <AddInventory products={productList} inventory={inventoryData} />
            }
          />
          <Route path="purchases" element={<Purchases />} />
          <Route path="retailers" element={<RetailerDetails />} />
          <Route path="suggestions" element={<Suggestions />} />
          <Route path="*" element={<Navigate to="/admin-dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
