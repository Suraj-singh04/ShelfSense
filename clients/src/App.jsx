import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import "tailwindcss/tailwind.css";
import "./index.css";

import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";

import Dashboard from "./pages/Dashboard";
import RetailerDashboard from "./pages/RetailerDashboard";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <Router>
      <div className={`${darkMode ? "dark" : ""}`}>
        <div className="flex">
          {/* Shared Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="ml-64 w-full min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
            {/* Top Bar */}
            <TopHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

            {/* Pages */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/retailer-dashboard"
                element={<RetailerDashboard />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
