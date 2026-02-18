import { useState, useEffect } from "react";
import {
    LayoutDashboard, Menu, X, Sparkles, LogOut, WalletCards, 
    UserCog, Star, BadgeCheck, Users2, Bell, 
    AudioWaveform, History, CalendarRange, NotebookTabs, 
    CloudUpload, MessageSquarePlus, ShieldCheck, Settings2,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import { useUser } from "../Context/UserContext"; 
import { useSidebar } from "../Context/SideBarContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminSidebar() {
    const location = useLocation();
    const { collapsed, toggleSidebar } = useSidebar();
    const navigate = useNavigate();
    const { logout } = useUser();
    
    // Close sidebar automatically on mobile after navigation
    const handleNavigation = (path) => {
        navigate(path);
        if (window.innerWidth < 1024) {
            toggleSidebar(); // Close drawer on mobile
        }
    };

    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: '/admin/dashboard/' },
        { label: "Users", icon: UserCog, path: '/admin/user/' },
        { label: "Group Community", icon: Users2, path: '/admin/group/' },
        { label: "AI & Chat", icon: MessageSquarePlus, path: '/admin/chat-bot/' },
        { label: "Focus/Pomodoro", icon: History, path: '/admin/pomodoro/' },
        { label: "Habit Tracking", icon: CalendarRange, path: '/admin/habit/' },
        { label: "Live Audio Notes", icon: AudioWaveform, path: '/admin/live-transcription/' },
        { label: "Upload Notes", icon: CloudUpload, path: '/admin/upload-transcription/' },
        { label: "Notes", icon: NotebookTabs, path: '/admin/notes/' },
        { label: "Subscription Plans", icon: BadgeCheck, path: '/admin/subscriptions/' },
        { label: "Reviews/Feedback", icon: Star, path: '/admin/review/' },
        { label: "Wallet", icon: WalletCards, path: '/admin/wallet/' },
        { label: "System Alerts", icon: Bell, path: '/admin/notification/' },
    ];

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <>
            {/* --- Mobile Overlay --- */}
            {/* Only visible when sidebar is NOT collapsed on mobile screens */}
            {!collapsed && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-500"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`fixed left-0 top-0 flex flex-col h-full bg-white dark:bg-slate-900 transition-all duration-500 ease-in-out z-50 border-r border-slate-100/80 dark:border-slate-800
                    ${collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-[280px] lg:w-72"}
                `}
            >
                <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex absolute -right-3 top-9 z-50 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-colors"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
                {/* --- Admin Branding --- */}
                <div className="h-20 flex items-center px-6 shrink-0 border-b border-slate-50/50 dark:border-slate-800/50">
                    <div className={`flex items-center w-full ${collapsed ? "justify-center" : "justify-between"}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none shrink-0">
                                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            </div>
                            {(window.innerWidth < 1024 || !collapsed) && (
                                <div className="flex flex-col">
                                    <span className="text-slate-800 dark:text-white font-black text-lg tracking-tight leading-none">
                                        EduFlow<span className="text-indigo-600 dark:text-indigo-400">.</span>
                                    </span>
                                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-widest mt-1">Admin Panel</span>
                                </div>
                            )}
                        </div>

                        {/* Close button - Only visible on mobile drawer */}
                        <button
                            onClick={toggleSidebar}
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all lg:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Settings icon - Only visible on desktop expanded */}
                        {!collapsed && (
                            <button
                                onClick={toggleSidebar}
                                className="hidden lg:block p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                            >
                                <Settings2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* --- Management Navigation --- */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;
                        
                        return (
                            <div
                                key={item.label}
                                onClick={() => handleNavigation(item.path)}
                                role="button"
                                className={`group flex items-center w-full px-3 py-3 rounded-xl transition-all duration-200 relative cursor-pointer mb-0.5
                                    ${active
                                        ? "bg-slate-900 dark:bg-slate-800 text-white shadow-xl shadow-slate-200 dark:shadow-none"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    }
                                `}
                            >
                                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 
                                    ${collapsed ? 'lg:mx-auto' : 'mr-3'} 
                                    ${active ? 'text-indigo-400' : ''}`} 
                                />

                                {(window.innerWidth < 1024 || !collapsed) && (
                                    <span className={`truncate text-[13px] font-semibold tracking-wide ${active ? "text-white" : "text-slate-600 dark:text-slate-300 group-hover:dark:text-white"}`}>
                                        {item.label}
                                    </span>
                                )}

                                {/* Desktop Tooltip (Hidden on Mobile) */}
                                {collapsed && (
                                    <div className="hidden lg:block fixed left-[80px] px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-bold rounded-lg 
                                        opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                                        translate-x-[-10px] group-hover:translate-x-0
                                        transition-all duration-300 whitespace-nowrap z-[9999] shadow-2xl border border-slate-700 dark:border-slate-600">
                                        {item.label}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* --- Logout Section --- */}
                <div className="p-4 mt-auto border-t border-slate-50 dark:border-slate-800">
                    {collapsed ? (
                        <button
                            onClick={() => logout()}
                            className="hidden lg:flex w-12 h-12 mx-auto items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            aria-label="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => logout()}
                            className="group flex items-center justify-between w-full bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 p-4 rounded-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                                    <LogOut className="w-4 h-4 text-slate-400 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400" />
                                </div>
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Sign out</span>
                            </div>
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}