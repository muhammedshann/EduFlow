import { Outlet } from "react-router-dom";
import Sidebar from "../Components/SideBar";
import { useSidebar } from "../Context/SideBarContext";
import { Menu, Sparkles } from "lucide-react"; 

export default function Layout() {
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    // Added dark:bg-slate-950 for the main background
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar - Ensure your Sidebar component has "fixed" and a z-index */}
      <Sidebar />
      
      <main
        className={`flex-1 transition-all duration-300 flex flex-col ${
          // Desktop margins remain the same
          collapsed ? "lg:ml-20" : "lg:ml-72" 
        }`} 
      >
        {/* --- Mobile Header (Visible only on lg:hidden) --- */}
        {/* Added dark:bg-slate-900 and dark:border-slate-800 */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 lg:hidden sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {/* Added dark:text-slate-100 */}
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">EduFlow</span>
          </div>
          <button 
            onClick={toggleSidebar}
            // Added dark:hover:bg-slate-800 and dark:text-slate-400
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 active:scale-95 transition-all"
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