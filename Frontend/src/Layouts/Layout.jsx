// src/layouts/Layout.js
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/SideBar";
import { useSidebar } from "../Context/SideBarContext";

export default function Layout() {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50 transition-all duration-300">
      <Sidebar />
      <main
        className={`flex-1 transition-all duration-300 p-6 ${
          collapsed ? "ml-20" : "ml-72"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
