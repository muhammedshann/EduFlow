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
            {/* --- iOS STYLE MOBILE DOCK --- */}
            <nav className="lg:hidden fixed bottom-6 left-5 right-5 z-[100] bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[3rem] px-2 py-3 overflow-hidden">
                <div className="flex items-center overflow-x-auto no-scrollbar gap-2 px-2 relative">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        
                        return (
                            <motion.button
                                key={item.label}
                                layout
                                whileTap={{ scale: 0.92 }}
                                onClick={() => handleNavClick(item.path)}
                                className={`flex items-center justify-center gap-3 py-3 px-5 rounded-full relative whitespace-nowrap transition-all duration-300
                                ${isActive ? "text-white" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200"}`}
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
                </div>
            </nav>

            {/* --- iOS STYLE DESKTOP RAIL --- */}
            <aside
                className={`hidden lg:flex fixed left-0 top-0 flex-col h-full bg-white dark:bg-[#07090f] transition-all duration-500 z-[50] border-r border-slate-100 dark:border-slate-800/60
                ${collapsed ? "w-24" : "w-80"}`}
            >
                {/* Brand Logo Section */}
                <div className="h-28 flex items-center px-10 shrink-0">
                    <div className={`flex items-center gap-4 ${collapsed ? "mx-auto" : ""}`}>
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-slate-800 dark:text-white font-black text-xl tracking-tighter leading-none">
                                    EduFlow<span className="text-indigo-600">.</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 opacity-60">Control</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Rail */}
                <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        
                        return (
                            <div
                                key={item.label}
                                onClick={() => handleNavClick(item.path)}
                                className={`group flex items-center w-full px-4 py-4 rounded-2xl transition-all duration-300 relative cursor-pointer
                                ${isActive ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}
                            >
                                <Icon className={`${collapsed ? 'mx-auto' : 'mr-5'} w-5 h-5 transition-transform group-hover:scale-110`} />
                                {!collapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                                {isActive && !collapsed && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-600 rounded-r-full" />}
                            </div>
                        );
                    })}
                </nav>

                {/* Token Balance Card */}
                <div className="p-8">
                    <div className={`rounded-[2.5rem] transition-all duration-500 overflow-hidden relative
                        ${collapsed ? "p-3 bg-slate-50 dark:bg-slate-800" : "p-7 bg-indigo-600 shadow-2xl text-white"}`}>
                        {!collapsed ? (
                            <>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center opacity-70 mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Balance</span>
                                        <Wallet size={16} />
                                    </div>
                                    <div className="text-4xl font-black">{userCredits?.remaining_credits || 0}</div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Wallet size={18} className="text-indigo-500" />
                                <span className="text-[10px] font-black">{userCredits?.remaining_credits || 0}</span>
                            </div>
                        )}
                    </div>

                    <button onClick={logout} className="mt-8 flex items-center w-full px-6 py-4 text-slate-400 hover:text-red-500 transition-colors font-bold text-xs uppercase tracking-widest">
                        <LogOut size={18} className={collapsed ? 'mx-auto' : 'mr-5'} />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>
        </LayoutGroup>
    );
}