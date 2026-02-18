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
        <>
            {/* --- ULTIMATE MOBILE DOCK (Phone Mode Only) --- */}
            <nav className="lg:hidden fixed bottom-6 left-5 right-5 z-[100] bg-white/70 dark:bg-slate-950/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-[3rem] px-2 py-3 overflow-hidden">
                <div className="flex items-center overflow-x-auto no-scrollbar gap-2 relative px-2">
                    <LayoutGroup>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            
                            return (
                                <motion.button
                                    key={item.label}
                                    layout
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleNavClick(item.path)}
                                    className={`flex items-center justify-center gap-3 py-3 px-5 rounded-full relative whitespace-nowrap transition-all
                                    ${isActive ? "text-white" : "text-slate-500 hover:text-indigo-600 dark:text-slate-400"}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activePillMobile"
                                            className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 rounded-full z-0 shadow-lg"
                                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                        />
                                    )}

                                    <div className="relative z-10 flex items-center gap-2">
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                        {isActive && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="text-xs font-black tracking-tight"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </LayoutGroup>
                </div>
            </nav>

            {/* --- YOUR ORIGINAL DESKTOP SIDEBAR (Untouched Layout) --- */}
            <aside
                className={`hidden lg:flex fixed left-0 top-0 flex-col h-full bg-white dark:bg-slate-900 transition-all duration-500 ease-in-out z-[50] border-r border-slate-100/60 dark:border-slate-800
                ${collapsed ? "lg:w-20" : "lg:w-72"}`}
            >
                {/* Desktop Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-9 z-50 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm transition-colors"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Brand Header */}
                <div className="h-20 flex items-center px-6 shrink-0 relative">
                    <div className={`flex items-center w-full ${collapsed ? "justify-center" : "justify-between"}`}>
                        <div className="relative w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                            <span className="text-slate-800 dark:text-slate-100 font-extrabold text-xl tracking-tight">
                                EduFlow<span className="text-indigo-600">.</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        
                        return (
                            <div
                                key={item.label}
                                onClick={() => handleNavClick(item.path)}
                                role="button"
                                className={`group flex items-center w-full px-3 py-3 rounded-xl transition-all duration-300 relative cursor-pointer outline-none mb-1
                                ${isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none"
                                    : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-slate-800/50"
                                }`}
                            >
                                <Icon className={`${collapsed ? 'mx-auto' : 'mr-3'} w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110`} />

                                {!collapsed && (
                                    <span className={`truncate text-sm font-medium tracking-wide ${isActive ? "text-white" : "text-slate-600"}`}>
                                        {item.label}
                                    </span>
                                )}

                                {collapsed && (
                                    <div className="fixed left-[80px] px-3 py-2 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 z-[9999] shadow-2xl">
                                        {item.label}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Balance & Sign Out */}
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
                        className={`flex items-center group rounded-xl w-full
                        ${collapsed ? "justify-center p-3 text-slate-400 hover:text-red-500" : "px-4 py-3 text-slate-500 hover:text-red-600 font-semibold text-sm"}`}
                    >
                        <LogOut className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} transition-transform group-hover:rotate-12`} />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}