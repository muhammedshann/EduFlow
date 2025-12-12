// src/layouts/Layout.js
import { Outlet } from "react-router-dom";
import { useSidebar } from "../Context/SideBarContext";
import AdminSidebar from "../Components/AdminSideBar";

export default function AdminLayout() {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50 transition-all duration-300">
      <AdminSidebar />
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
