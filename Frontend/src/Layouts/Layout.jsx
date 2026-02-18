import { Outlet } from "react-router-dom";
import Sidebar from "../Components/SideBar"; 
import { Sparkles } from "lucide-react";
import { useSelector } from "react-redux"; // Added to fetch actual credits

export default function Layout() {
  // Fetching real credits from your existing Redux state logic
  const { userCredits } = useSelector((state) => state.subscriptions);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />
      
      <main className="flex-1 flex flex-col w-full">
        <header className="flex items-center justify-between px-6 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-slate-800 dark:text-slate-100 text-sm tracking-tight">
              EduFlow<span className="text-indigo-600">.</span>
            </span>
          </div>
          
          <div className="hidden sm:flex items-center px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
            <span className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">Balance</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {userCredits?.remaining_credits || 0} 
            </span>
          </div>
        </header>

        {/* --- FIXED SECTION: NO SIDE MARGINS OR PADDING --- */}
        <div className="flex-1 w-full flex flex-col pb-32">
          <Outlet />
        </div>
      </main>
    </div>
  );
}