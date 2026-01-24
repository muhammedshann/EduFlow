import { Outlet } from "react-router-dom";
import Sidebar from "../Components/SideBar";
import { useSidebar } from "../Context/SideBarContext";
import { Menu, Sparkles } from "lucide-react"; // Added icons for the mobile header

export default function Layout() {
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Ensure your Sidebar component has "fixed" and a z-index */}
      <Sidebar />
      
      <main
        className={`flex-1 transition-all duration-300 flex flex-col ${
          // Desktop margins remain the same
          // Added lg: prefix to margins so they don't apply on mobile
          collapsed ? "lg:ml-20" : "lg:ml-72" 
        }`} 
      >
        {/* --- Mobile Header (Visible only on lg:hidden) --- */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 lg:hidden sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">EduFlow</span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 active:scale-95 transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 w-full flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}