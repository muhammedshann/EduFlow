import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../Components/SideBar"; 
import { Sparkles, Bot, Sparkle } from "lucide-react";
import { useSelector } from "react-redux";

export default function Layout() {
  const { userCredits } = useSelector((state) => state.subscriptions);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 transition-colors duration-300">
      <Sidebar />
      
      {/* FIXED: Removed 'min-h-screen' here. 'flex-1' is all it needs to fill the exact height without creating an overflow gap. */}
      <main className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-slate-800 dark:text-slate-100 text-sm tracking-tight">
              EduFlow<span className="text-indigo-600">.</span>
            </span>
          </div>
          
          <div className="hidden sm:flex items-center px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">Balance</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {userCredits?.remaining_credits || 0} 
            </span>
          </div>
        </header>

        {/* Outlet wrapper is perfectly flush */}
        <div className="flex-1 flex flex-col w-full">
          <Outlet />
        </div>
      </main>

      {/* --- ChatGPT / Gemini Style Floating Chat Button --- */}
      <button 
        onClick={() => navigate('/chat-bot/')}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-50 p-2 hover:scale-110 active:scale-95 transition-transform duration-300 group flex items-center justify-center"
        title="Open AI Chat"
      >
        {/* Ambient glow behind the logo */}
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl scale-150 rounded-full group-hover:bg-purple-500/30 transition-colors duration-500 pointer-events-none"></div>
        
        <div className="relative flex items-center justify-center">
            {/* Main Logo */}
            <div className="text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                <Bot className="w-10 h-10 drop-shadow-xl" />
            </div>
            {/* Magical Sparkle Effect */}
            <Sparkles className="w-5 h-5 text-purple-500 absolute -top-2 -right-3 animate-pulse drop-shadow-md" />
        </div>
      </button>

    </div>
  );
}