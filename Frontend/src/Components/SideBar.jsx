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

    useEffect(() => { dispatch(FetchCredit()); }, [location.pathname, dispatch]);

    const handleNavClick = (path) => navigate(path);

    return (
        <>
            {/* --- SLIDING LIQUID MOBILE DOCK --- */}
            <nav className="lg:hidden fixed bottom-6 left-4 right-4 z-[100] bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl border border-white/20 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] px-3 py-3 overflow-hidden">
                <div className="flex items-center overflow-x-auto no-scrollbar gap-2 relative">
                    <LayoutGroup>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            
                            return (
                                <motion.button
                                    key={item.label}
                                    layout
                                    onClick={() => handleNavClick(item.path)}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-full transition-colors relative whitespace-nowrap
                                    ${isActive ? "text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                                >
                                    {/* Liquid Background Slide */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activePill"
                                            className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full z-0 shadow-lg shadow-indigo-500/30"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}

                                    <div className="relative z-10">
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>

                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-xs font-bold relative z-10"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </LayoutGroup>
                </div>
            </nav>

            {/* --- PREMIUM DESKTOP SIDEBAR --- */}
            <aside
                className={`hidden lg:flex fixed left-0 top-0 flex-col h-full bg-white dark:bg-[#080b14] transition-all duration-500 ease-in-out z-[50] border-r border-slate-100 dark:border-slate-800/60
                ${collapsed ? "w-24" : "w-72"}`}
            >
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-10 z-50 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-xl transition-transform hover:scale-110"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                <div className="h-24 flex items-center px-8 shrink-0">
                    <div className={`flex items-center gap-4 ${collapsed ? "mx-auto" : ""}`}>
                        <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-slate-800 dark:text-slate-100 font-black text-xl tracking-tight leading-none">
                                    EduFlow<span className="text-indigo-600">.</span>
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Admin</span>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 px-5 py-4 space-y-2 overflow-y-auto no-scrollbar">
                    <LayoutGroup>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            
                            return (
                                <div
                                    key={item.label}
                                    onClick={() => handleNavClick(item.path)}
                                    className={`group flex items-center w-full px-4 py-3.5 rounded-2xl transition-all duration-300 relative cursor-pointer
                                    ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="desktopActive"
                                            className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl z-0"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    {isActive && <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-600 rounded-r-full z-10" />}
                                    
                                    <Icon className={`${collapsed ? 'mx-auto' : 'mr-4'} w-5 h-5 shrink-0 transition-transform group-hover:scale-110 relative z-10`} />

                                    {!collapsed && <span className="truncate text-sm font-semibold relative z-10">{item.label}</span>}
                                </div>
                            );
                        })}
                    </LayoutGroup>
                </nav>

                <div className="p-6">
                    <div className={`relative overflow-hidden transition-all duration-500 rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-sm
                        ${collapsed ? "p-3 bg-slate-50 dark:bg-slate-800/50" : "p-5 bg-gradient-to-br from-indigo-500 to-violet-600"}`}>
                        {!collapsed ? (
                            <div className="relative z-10 text-white">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">Credits</span>
                                    <Wallet className="w-4 h-4 opacity-80" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-black">{userCredits?.remaining_credits || 0}</span>
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
                        className="mt-6 flex items-center w-full px-5 py-3.5 text-slate-400 hover:text-red-500 transition-all rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 font-bold text-xs uppercase tracking-widest"
                    >
                        <LogOut className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-4'}`} />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}