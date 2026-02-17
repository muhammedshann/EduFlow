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
import { motion } from "framer-motion"; // Optional: for fluid animations

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

    useEffect(() => { dispatch(FetchCredit()); }, [location.pathname, dispatch]);

    const handleNavClick = (path) => navigate(path);

    return (
        <>
            {/* --- REFINED MOBILE BOTTOM DOCK --- */}
            <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-[100] bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[2.5rem] px-2 pt-2 pb-2">
                <div className="flex overflow-x-auto no-scrollbar gap-1 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        
                        return (
                            <button
                                key={item.label}
                                onClick={() => handleNavClick(item.path)}
                                className={`flex flex-col items-center justify-center min-w-[70px] py-2 px-1 rounded-2xl transition-all duration-500 relative
                                ${isActive 
                                    ? "text-indigo-600 dark:text-indigo-400" 
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                }`}
                            >
                                <Icon size={20} className={`${isActive ? 'scale-110 mb-1' : 'scale-100'} transition-transform duration-300`} />
                                <span className={`text-[9px] font-bold uppercase tracking-wider transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                    {item.label.split(' ')[0]}
                                </span>
                                {isActive && (
                                    <span className="absolute -bottom-1 w-5 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* --- PREMIUM DESKTOP SIDEBAR --- */}
            <aside
                className={`hidden lg:flex fixed left-0 top-0 flex-col h-full bg-white dark:bg-[#0b0f1a] transition-all duration-500 ease-in-out z-[50] border-r border-slate-100 dark:border-slate-800/60
                ${collapsed ? "w-24" : "w-72"}`}
            >
                {/* Collapsible Trigger */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-10 z-50 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-xl transition-all hover:scale-110"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Brand Header */}
                <div className="h-24 flex items-center px-8 shrink-0 relative">
                    <div className={`flex items-center gap-4 ${collapsed ? "mx-auto" : ""}`}>
                        <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-slate-800 dark:text-slate-100 font-black text-xl tracking-tight leading-none">
                                    EduFlow<span className="text-indigo-600">.</span>
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Platform</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-5 py-4 space-y-2 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        
                        return (
                            <div
                                key={item.label}
                                onClick={() => handleNavClick(item.path)}
                                role="button"
                                className={`group flex items-center w-full px-4 py-3.5 rounded-2xl transition-all duration-300 relative cursor-pointer outline-none
                                ${isActive
                                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                }`}
                            >
                                {isActive && <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-600 rounded-r-full" />}
                                
                                <Icon className={`${collapsed ? 'mx-auto' : 'mr-4'} w-5 h-5 shrink-0 transition-transform group-hover:scale-110`} />

                                {!collapsed && (
                                    <span className={`truncate text-sm font-semibold tracking-wide transition-colors ${isActive ? "text-indigo-700 dark:text-indigo-300" : ""}`}>
                                        {item.label}
                                    </span>
                                )}

                                {collapsed && (
                                    <div className="fixed left-[90px] px-3 py-2 bg-slate-900 text-white text-[11px] font-bold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 z-[9999] shadow-2xl">
                                        {item.label}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Bottom Card (Credits) */}
                <div className="p-6">
                    <div className={`relative overflow-hidden transition-all duration-500 rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-sm
                        ${collapsed ? "p-3 bg-slate-50 dark:bg-slate-800/50" : "p-5 bg-gradient-to-br from-indigo-500 to-violet-600"}`}>
                        
                        {/* Background Decor */}
                        {!collapsed && <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />}

                        {!collapsed ? (
                            <div className="relative z-10 text-white">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">Credits</span>
                                    <Wallet className="w-4 h-4 opacity-80" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-black tabular-nums">{userCredits?.remaining_credits || 0}</span>
                                    <span className="text-[10px] font-bold mb-1.5 opacity-80">PCS</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1">
                                 <Wallet className="w-5 h-5 text-indigo-500" />
                                 <span className="text-[10px] font-black text-slate-800 dark:text-slate-100">{userCredits?.remaining_credits || 0}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => logout()}
                        className="mt-6 flex items-center group w-full px-5 py-3.5 text-slate-400 hover:text-red-500 transition-all rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 font-bold text-xs uppercase tracking-widest"
                    >
                        <LogOut className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-4'} transition-transform group-hover:-translate-x-1`} />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}