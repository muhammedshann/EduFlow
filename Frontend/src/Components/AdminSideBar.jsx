import { useState, useEffect } from "react";
import {
    LayoutDashboard, Menu, X, Sparkles, LogOut, WalletCards, 
    UserCog, Star, BadgeCheck, Users2, Bell, 
    AudioWaveform, History, CalendarRange, NotebookTabs, 
    CloudUpload, MessageSquarePlus, ShieldCheck, Settings2,
    ChevronRight, ChevronLeft
} from "lucide-react";
import { useUser } from "../Context/UserContext"; 
import { useSidebar } from "../Context/SideBarContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminSidebar() {
    const location = location = useLocation();
    const { collapsed, toggleSidebar } = useSidebar();
    const navigate = useNavigate();
    const { logout } = useUser();
    
    const handleNavigation = (path) => {
        navigate(path);
    };

    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: '/admin/dashboard/' },
        { label: "Users", icon: UserCog, path: '/admin/user/' },
        { label: "Community", icon: Users2, path: '/admin/group/' }, // Shortened for mobile
        { label: "AI Chat", icon: MessageSquarePlus, path: '/admin/chat-bot/' },
        { label: "Pomodoro", icon: History, path: '/admin/pomodoro/' },
        { label: "Habits", icon: CalendarRange, path: '/admin/habit/' },
        { label: "Audio", icon: AudioWaveform, path: '/admin/live-transcription/' },
        { label: "Upload", icon: CloudUpload, path: '/admin/upload-transcription/' },
        { label: "Notes", icon: NotebookTabs, path: '/admin/notes/' },
        { label: "Plans", icon: BadgeCheck, path: '/admin/subscriptions/' },
        { label: "Reviews", icon: Star, path: '/admin/review/' },
        { label: "Wallet", icon: WalletCards, path: '/admin/wallet/' },
        { label: "Alerts", icon: Bell, path: '/admin/notification/' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* --- MOBILE BOTTOM NAVIGATION (Phone Mode) --- */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 pt-2 pb-safe-area">
                <div className="flex overflow-x-auto no-scrollbar gap-1 pb-2">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.label}
                                onClick={() => handleNavigation(item.path)}
                                className={`flex flex-col items-center justify-center min-w-[75px] py-2 px-1 rounded-xl transition-all duration-300
                                    ${active 
                                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10" 
                                        : "text-slate-400 dark:text-slate-500"
                                    }`}
                            >
                                <Icon size={20} className={`${active ? 'scale-110' : 'scale-100'} transition-transform`} />
                                <span className={`text-[10px] mt-1.5 font-bold uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-70'}`}>
                                    {item.label}
                                </span>
                                {active && (
                                    <div className="absolute bottom-1 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                    {/* Logout for mobile at the end of scroll */}
                    <button
                        onClick={() => logout()}
                        className="flex flex-col items-center justify-center min-w-[75px] py-2 text-red-500 opacity-70"
                    >
                        <LogOut size={20} />
                        <span className="text-[10px] mt-1.5 font-bold uppercase tracking-tighter">Exit</span>
                    </button>
                </div>
            </nav>

            {/* --- DESKTOP SIDEBAR (Kept same as your original, hidden on mobile) --- */}
            <aside
                className={`hidden lg:flex fixed left-0 top-0 flex-col h-full bg-white dark:bg-slate-900 transition-all duration-500 ease-in-out z-50 border-r border-slate-100/80 dark:border-slate-800
                    ${collapsed ? "w-20" : "w-72"}
                `}
            >
                {/* ... (Keep your existing sidebar inner content here) ... */}
                <div className="h-20 flex items-center px-6 shrink-0 border-b border-slate-50/50 dark:border-slate-800/50">
                    <div className={`flex items-center w-full ${collapsed ? "justify-center" : "justify-between"}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col">
                                    <span className="text-slate-800 dark:text-white font-black text-lg tracking-tight leading-none">
                                        EduFlow<span className="text-indigo-600 dark:text-indigo-400">.</span>
                                    </span>
                                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-widest mt-1">Admin Panel</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.label}
                                onClick={() => handleNavigation(item.path)}
                                className={`group flex items-center w-full px-3 py-3 rounded-xl cursor-pointer mb-0.5 transition-all
                                    ${active
                                        ? "bg-slate-900 dark:bg-slate-800 text-white shadow-xl"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'} ${active ? 'text-indigo-400' : ''}`} />
                                {!collapsed && <span className="text-[13px] font-semibold">{item.label}</span>}
                            </div>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}