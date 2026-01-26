import { Outlet } from "react-router-dom";
import { useSidebar } from "../Context/SideBarContext";
import AdminSidebar from "../Components/AdminSideBar";
import { Menu } from "lucide-react";

export default function AdminLayout() {
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-slate-700 lg:hidden sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">Admin</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
