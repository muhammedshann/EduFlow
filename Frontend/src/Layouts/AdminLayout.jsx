import { Outlet } from "react-router-dom";
import { useSidebar } from "../Context/SideBarContext";
import AdminSidebar from "../Components/AdminSideBar";
import { Menu } from "lucide-react"; // Import Menu icon for the mobile toggle

export default function AdminLayout() {
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          // Desktop: Apply margin to push content
          // Mobile: No margin because sidebar is an overlay (translate-x)
          collapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        {/* --- Mobile Top Header --- */}
        {/* This only shows on mobile to allow users to open the sidebar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 lg:hidden sticky top-0 z-30">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">E</span>
             </div>
             <span className="font-bold text-slate-800">Admin</span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* --- Main Page Content --- */}
        <main className="p-4 md:p-8 flex-1">
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}