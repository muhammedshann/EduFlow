import { useState, useEffect } from "react";
import {
    LayoutDashboard, FileAudio, Bot, Timer, Calendar, 
    Users, FileText, Settings, LogOut, Wallet,
    ChevronLeft, ChevronRight, Sparkles 
} from "lucide-react";
import { useUser } from "../Context/UserContext";
import { useSidebar } from "../Context/SideBarContext";
import { useLocation, useNavigate } from "react-router-dom";
import { FetchCredit } from "../Redux/SubscriptionSlice";
import { useDispatch, useSelector } from "react-redux";
import { motion, LayoutGroup } from "framer-motion";

export default function Sidebar() {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { collapsed, toggleSidebar } = useSidebar();
    const { logout } = useUser();
    const { userCredits } = useSelector((state) => state.subscriptions);

    const navItems = [
        { label: "Home", icon: LayoutDashboard, path: '/dashboard' },
        { label: "Smart Notes", icon: FileAudio, path: '/smart-note/' },
        { label: "AI Chat", icon: Bot, path: '/chat-bot/' },
        { label: "Pomodoro", icon: Timer, path: '/promodoro/' },
        { label: "Habits", icon: Calendar, path: '/habit-tracker/' },
        { label: "Groups", icon: Users, path: '/groups/' },
        { label: "Notes", icon: FileText, path: '/notes/' },
        { label: "Wallet", icon: Wallet, path: '/wallet/' },
        { label: "Settings", icon: Settings, path: '/settings/' },
    ];

    useEffect(() => { 
        dispatch(FetchCredit()); 
    }, [location.pathname, dispatch]);

    const handleNavClick = (path) => navigate(path);

    return (
        <LayoutGroup>
            {/* --- iOS CLASS MOBILE DOCK (Phone Experience) --- */}
            <nav className="lg:hidden fixed bottom-6 left-5 right-5 z-[100] bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[3rem] px-2 py-3 overflow-hidden">
                <div className="flex items-center overflow-x-auto no-scrollbar gap-2 px-2 relative">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        
                        return (
                            <motion.button
                                key={item.label}
                                layout
                                whileTap={{ scale: 0.92 }} // Native "squish" feel
                                onClick={() => handleNavClick(item.path)}
                                className={`flex items-center justify-center gap-3 py-3 px-5 rounded-full relative whitespace-nowrap transition-all duration-300
                                ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="iosActivePill"
                                        className="absolute inset-0 bg-indigo-600 dark:bg-indigo-500 rounded-full z-0 shadow-lg shadow-indigo-500/30"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}

                                <div className="relative z-10 flex items-center gap-2">
                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-xs font-bold tracking-tight"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                    
                    {/* Mobile Logout */}
                    <button
                        onClick={() => logout()}
                        className="flex items-center justify-center gap-2 py-3 px-5 text-red-500/80 font-bold text-xs uppercase tracking-widest whitespace-nowrap"
                    >
                        <LogOut size={20} />
                        <span>Exit</span>
                    </button>
                </div>
            </nav>

            {/* --- YOUR ORIGINAL DESKTOP SIDEBAR --- */}
            <aside
                className={`hidden lg:flex fixed left-0 top-0 flex-col h-full bg-white dark:bg-slate-900 transition-all duration-500 ease-in-out z-[50] border-r border-slate-100/60 dark:border-slate-800
                ${collapsed ? "lg:w-20" : "lg:w-72"}`}
            >
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-9 z-50 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm transition-colors"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                <div className="h-20 flex items-center px-6 shrink-0 relative">
                    <div className={`flex items-center w-full ${collapsed ? "justify-center" : "justify-between"}`}>
                        <div className="relative w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                            <span className="text-slate-800 dark:text-slate-100 font-extrabold text-xl tracking-tight">
                                EduFlow<span className="text-indigo-600">.</span>
                            </span>
                        )}
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <div
                                key={item.label}
                                onClick={() => handleNavClick(item.path)}
                                role="button"
                                className={`group flex items-center w-full px-3 py-3 rounded-xl transition-all duration-500 relative cursor-pointer outline-none mb-1
                                ${isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none"
                                    : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-800/50"
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="desktopActive"
                                        className="absolute inset-0 bg-indigo-600 rounded-xl z-0"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Icon className={`${collapsed ? 'mx-auto' : 'mr-3'} w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10`} />
                                {!collapsed && (
                                    <span className={`truncate text-sm font-medium tracking-wide relative z-10 ${isActive ? "text-white" : "text-slate-600 dark:text-slate-300"}`}>
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="p-4 space-y-4">
                    <div className={`transition-all duration-500 rounded-2xl border border-indigo-50 dark:border-slate-700
                        ${collapsed ? "p-2 bg-white dark:bg-slate-800" : "p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"}`}>
                        {!collapsed ? (
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Balance</span>
                                    <Wallet className="w-3.5 h-3.5 text-indigo-400" />
                                </div>
                                <div className="flex items-end gap-1.5">
                                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{userCredits?.remaining_credits || 0}</span>
                                    <span className="text-slate-400 text-[10px] font-bold mb-1.5">TOKENS</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-2 gap-1">
                                 <Wallet className="w-4 h-4 text-indigo-500" />
                                 <span className="text-[10px] font-black text-slate-800 dark:text-slate-100">{userCredits?.remaining_credits || 0}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => logout()}
                        className={`flex items-center group transition-all duration-300 rounded-xl w-full
                        ${collapsed ? "justify-center p-3 text-slate-400 hover:text-red-500" : "px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold text-sm"}`}
                    >
                        <LogOut className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} transition-transform group-hover:rotate-12`} />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>
        </LayoutGroup>
    );
}