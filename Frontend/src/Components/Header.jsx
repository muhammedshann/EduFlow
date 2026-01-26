import { useState } from "react";
import { Bot, Menu, X, LogOut, Moon, Sun } from "lucide-react";
import { useDispatch } from "react-redux";
// import { Logout } from "../Redux/AuthSlice"; // Assuming this is handled by useUser now
import { useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import { useTheme } from "../Context/ThemeContext"; // Import Theme Context

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useUser();
  const { isDarkMode, toggleTheme } = useTheme(); // Use Theme Hook
  const navigate = useNavigate();

  return (
    <header className="fixed w-full top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* --- Logo --- */}
        <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-6 h-6 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center transition-colors">
              <Bot className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            EduFlow
          </span>
        </div>

        {/* --- Desktop Nav --- */}
        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'Resources', 'Pricing', 'About'].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase()}`} 
              className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* --- Right Actions --- */}
        <div className="hidden md:flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Theme"
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth Buttons */}
            {user ? (
                <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium transition-colors"
                onClick={() => logout()}
                >
                <LogOut className="w-4 h-4" />
                Logout
                </button>
            ) : (
                <button 
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-lg font-bold text-sm hover:shadow-lg transform hover:-translate-y-0.5 transition-all" 
                    onClick={() => navigate('/auth/')}
                >
                Get Started
                </button>
            )}
        </div>

        {/* --- Mobile Menu Button --- */}
        <div className="flex items-center gap-4 md:hidden">
            {/* Mobile Theme Toggle */}
            <button 
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-slate-400"
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
                className="p-2 text-gray-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>
      </div>

      {/* --- Mobile Drawer --- */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-xl flex flex-col items-center py-6 space-y-6 md:hidden animate-in slide-in-from-top-5 duration-200">
          {['Features', 'Resources', 'Pricing', 'About'].map((item) => (
            <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="text-lg font-medium text-gray-700 dark:text-slate-200"
                onClick={() => setIsOpen(false)}
            >
                {item}
            </a>
          ))}
          
          <hr className="w-10 border-gray-200 dark:border-slate-700" />

          {user ? (
             <button
                className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium"
                onClick={() => { logout(); setIsOpen(false); }}
             >
                <LogOut className="w-5 h-5" />
                Logout
             </button>
          ) : (
              <button 
                className="w-3/4 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20" 
                onClick={() => { navigate('/auth/'); setIsOpen(false); }}
              >
                Get Started
              </button>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;