import { useState, useEffect } from "react";
import {
    LayoutDashboard, FileAudio, Bot, Timer, Calendar, 
    Users, FileText, Settings, LogOut, Wallet, Sparkles 
} from "lucide-react";
import { useUser } from "../Context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { FetchCredit } from "../Redux/SubscriptionSlice";
import { useDispatch, useSelector } from "react-redux";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";

export default function Sidebar() {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
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
        <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
            <LayoutGroup>
                {/* --- THE UNIVERSAL FLOATING DOCK --- */}
                <motion.nav 
                    layout
                    className="pointer-events-auto flex items-center gap-1 p-2 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] max-w-full overflow-x-auto no-scrollbar"
                >
                    {/* Brand Logo (Hidden on very small screens to save space) */}
                    <div className="hidden sm:flex items-center justify-center px-3 border-r border-slate-200 dark:border-slate-800 mr-1">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        
                        return (
                            <motion.button
                                key={item.label}
                                layout
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.92 }}
                                onClick={() => handleNavClick(item.path)}
                                className={`group flex items-center justify-center gap-2 py-3 px-4 md:px-5 rounded-full relative whitespace-nowrap transition-all duration-300
                                ${isActive ? "text-white" : "text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400"}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="universalActivePill"
                                        className="absolute inset-0 bg-indigo-600 dark:bg-indigo-500 rounded-full z-0 shadow-lg shadow-indigo-500/30"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}

                                <div className="relative z-10 flex items-center gap-2">
                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    
                                    {/* Label: Only shown when active or on desktop hover to keep it neat */}
                                    <AnimatePresence>
                                        {(isActive) && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="text-xs font-bold tracking-tight overflow-hidden"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Desktop Credits Tooltip (Shown on Wallet hover) */}
                                {item.label === "Wallet" && (
                                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <div className="bg-slate-900 dark:bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap shadow-xl">
                                            {userCredits?.remaining_credits || 0} TOKENS
                                        </div>
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                    
                    {/* Logout Button */}
                    <button
                        onClick={() => logout()}
                        className="flex items-center justify-center p-3 ml-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                    >
                        <LogOut size={20} />
                    </button>
                </motion.nav>
            </LayoutGroup>
        </div>
    );
}