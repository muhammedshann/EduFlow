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
            {/* --- MOBILE: CINEMATIC DOCK --- */}
            <nav className="lg:hidden fixed bottom-6 left-5 right-5 z-[100] bg-white/70 dark:bg-slate-950/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-[3rem] px-2 py-3 overflow-hidden">
                <div className="flex items-center overflow-x-auto no-scrollbar gap-2 px-2 relative">
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
                                ${isActive ? "text-white" : "text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"}`}
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
                                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-black">
                                            {item.label}
                                        </motion.span>
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </nav>

            {/* --- DESKTOP: FLOATING GLASS-RAIL --- */}
            <aside
                className={`hidden lg:flex fixed left-6 top-6 bottom-6 flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-[50] 
                bg-white/70 dark:bg-[#07090f]/80 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)]
                ${collapsed ? "w-24" : "w-80"}`}
            >
                {/* Refined Trigger Toggle */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleSidebar}
                    className="absolute -right-4 top-12 z-50 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl cursor-pointer"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </motion.button>

                {/* Brand Branding */}
                <div className="h-32 flex items-center px-10 shrink-0">
                    <div className={`flex items-center gap-5 ${collapsed ? "mx-auto" : ""}`}>
                        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-slate-900 dark:text-slate-50 font-black text-2xl tracking-tighter">
                                    EduFlow<span className="text-indigo-600">.</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1 opacity-60">Admin</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation with Liquid Slide */}
                <nav className="flex-1 px-6 py-4 space-y-3 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <div
                                key={item.label}
                                onClick={() => handleNavClick(item.path)}
                                className={`group flex items-center w-full px-5 py-4 rounded-[1.25rem] transition-all duration-500 relative cursor-pointer
                                ${isActive ? "text-indigo-600 dark:text-indigo-300" : "text-slate-500 hover:text-indigo-600 dark:hover:text-slate-200"}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="desktopActivePill"
                                        className="absolute inset-0 bg-indigo-50/50 dark:bg-indigo-500/10 rounded-[1.25rem] z-0"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Icon className={`${collapsed ? 'mx-auto' : 'mr-5'} w-5 h-5 shrink-0 transition-transform group-hover:scale-125 relative z-10`} />
                                {!collapsed && <span className="truncate text-sm font-bold tracking-tight relative z-10">{item.label}</span>}
                            </div>
                        );
                    })}
                </nav>

                {/* Boutique Credit Card */}
                <div className="p-8">
                    <div className={`relative overflow-hidden transition-all duration-500 rounded-[2.5rem]
                        ${collapsed ? "p-3 bg-slate-100 dark:bg-slate-800" : "p-7 bg-indigo-600 shadow-2xl"}`}>
                        {!collapsed ? (
                            <div className="relative z-10 text-white">
                                <div className="flex items-center justify-between mb-5">
                                    <span className="text-[10px] uppercase tracking-widest font-black opacity-60">Balance</span>
                                    <Wallet className="w-4 h-4 opacity-80" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black">{userCredits?.remaining_credits || 0}</span>
                                    <span className="text-xs font-bold opacity-60">TOKENS</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1">
                                 <Wallet className="w-5 h-5 text-indigo-500" />
                                 <span className="text-[10px] font-black">{userCredits?.remaining_credits || 0}</span>
                            </div>
                        )}
                        {!collapsed && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400 rounded-full blur-[60px] opacity-50" />}
                    </div>

                    <button
                        onClick={() => logout()}
                        className="mt-10 flex items-center w-full px-6 py-4 text-slate-400 hover:text-red-500 transition-all rounded-[1.5rem] hover:bg-red-50 dark:hover:bg-red-500/10 font-black text-xs uppercase tracking-[0.2em]"
                    >
                        <LogOut className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-5'}`} />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>
        </LayoutGroup>
    );
}