import { useState, useEffect } from "react";
import {
    LayoutDashboard, FileAudio, Bot, Timer, Calendar, 
    Users, FileText, Settings, Menu, X, Sparkles, LogOut, Wallet
} from "lucide-react";
import { useUser } from "../Context/UserContext";
import { useSidebar } from "../Context/SideBarContext";
import { useLocation, useNavigate } from "react-router-dom";
import { FetchCredit } from "../Redux/SubscriptionSlice";
import { useDispatch, useSelector } from "react-redux";

export default function Sidebar() {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { collapsed, toggleSidebar } = useSidebar();
    const { logout } = useUser();
    
    const { userCredits } = useSelector((state) => state.subscriptions);

    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: '/dashboard' },
        { label: "Smart Notes", icon: FileAudio, path: '/smart-note/' },
        { label: "AI Chat", icon: Bot, path: '/chat-bot/' },
        { label: "Pomodoro", icon: Timer, path: '/promodoro/' },
        { label: "Habit Tracker", icon: Calendar, path: '/habit-tracker/' },
        { label: "Groups", icon: Users, path: '/groups/' },
        { label: "Notes", icon: FileText, path: '/notes/' },
        { label: "Wallet", icon: Wallet, path: '/wallet/' },
        { label: "Settings", icon: Settings, path: '/settings/' },
    ];

    useEffect(() => {
        dispatch(FetchCredit());
    }, [location.pathname, dispatch]);

    // Close sidebar on mobile after clicking a link
    const handleNavClick = (path) => {
        navigate(path);
        if (window.innerWidth < 1024) toggleSidebar();
    };

    return (
        <>
            {/* --- Mobile Backdrop --- */}
            {!collapsed && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-500"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`fixed left-0 top-0 flex flex-col h-full bg-white transition-all duration-500 ease-in-out z-[50] border-r border-slate-100/60
                ${collapsed 
                    ? "-translate-x-full lg:translate-x-0 lg:w-20" // Hidden on mobile, 20 on desktop
                    : "translate-x-0 w-[280px] lg:w-72" // Drawer on mobile, 72 on desktop
                }`}
            >
                {/* --- Brand Header --- */}
                <div className="h-20 flex items-center px-6 shrink-0 relative">
                    <div className={`flex items-center w-full ${collapsed ? "justify-center" : "justify-between"}`}>
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            {(!collapsed || window.innerWidth < 1024) && (
                                <span className="text-slate-800 font-extrabold text-xl tracking-tight">
                                    EduFlow<span className="text-indigo-600">.</span>
                                </span>
                            )}
                        </div>

                        {/* Close button - Only visible on Mobile Drawer */}
                        {!collapsed && (
                            <button
                                onClick={toggleSidebar}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 lg:hidden"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        )}
                        
                        {/* Desktop Menu Button */}
                        {!collapsed && (
                             <button
                                onClick={toggleSidebar}
                                className="hidden lg:block p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* --- Navigation --- */}
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
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                    : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
                                }`}
                            >
                                <Icon className={`${(collapsed && window.innerWidth >= 1024) ? 'mx-auto' : 'mr-3'} w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110`} />

                                {(!collapsed || window.innerWidth < 1024) && (
                                    <span className={`truncate text-sm font-medium tracking-wide ${isActive ? "text-white" : "text-slate-600 group-hover:text-indigo-600"}`}>
                                        {item.label}
                                    </span>
                                )}

                                {/* Desktop Tooltip (Hidden on Mobile) */}
                                {collapsed && window.innerWidth >= 1024 && (
                                    <div className="fixed left-[80px] px-3 py-2 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 z-[9999] shadow-2xl">
                                        {item.label}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* --- Bottom Utility --- */}
                <div className="p-4 space-y-4">
                    <div className={`relative overflow-hidden transition-all duration-500 rounded-2xl border border-indigo-50 shadow-sm
                        ${(collapsed && window.innerWidth >= 1024) ? "p-2 bg-white" : "p-4 bg-gradient-to-br from-white to-slate-50"}`}>
                        {(!collapsed || window.innerWidth < 1024) ? (
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Balance</span>
                                    <Wallet className="w-3.5 h-3.5 text-indigo-400" />
                                </div>
                                <div className="flex items-end gap-1.5">
                                    <span className="text-2xl font-black text-slate-800 tabular-nums">{userCredits?.remaining_credits || 0}</span>
                                    <span className="text-slate-400 text-[10px] font-bold mb-1.5">TOKENS</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-2 gap-1">
                                 <Wallet className="w-4 h-4 text-indigo-500" />
                                 <span className="text-[10px] font-black text-slate-800">{userCredits?.remaining_credits || 0}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => logout()}
                        className={`flex items-center group transition-all duration-300 rounded-xl
                        ${(collapsed && window.innerWidth >= 1024)
                            ? "justify-center w-full p-3 text-slate-400 hover:text-red-500" 
                            : "w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 font-semibold text-sm"
                        }`}
                    >
                        <LogOut className={`w-5 h-5 ${(collapsed && window.innerWidth >= 1024) ? '' : 'mr-3'} transition-transform group-hover:rotate-12`} />
                        {(!collapsed || window.innerWidth < 1024) && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}