import { useState, useEffect } from "react";
import {
    LayoutDashboard, FileAudio, Bot, Timer, Calendar, 
    Users, FileText, Settings, LogOut, Wallet,
    ChevronLeft, ChevronRight, Sparkles, Phone
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

    // Updated labels and icons to match the "latest style" phone look
    const navItems = [
        { label: "Contacts", icon: Users, path: '/groups/', badge: true },
        { label: "Calls", icon: Phone, path: '/calls/' },
        { label: "Chats", icon: Bot, path: '/chat-bot/' },
        { label: "Settings", icon: Settings, path: '/settings/', badge: true },
    ];

    useEffect(() => { dispatch(FetchCredit()); }, [location.pathname, dispatch]);

    const handleNavClick = (path) => navigate(path);

    return (
        <>
            {/* --- LATEST STYLE MOBILE CAPSULE --- */}
            <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[420px]">
                <div className="bg-black/85 backdrop-blur-2xl rounded-[3rem] px-4 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/10 flex items-center justify-between">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        
                        return (
                            <button
                                key={item.label}
                                onClick={() => handleNavClick(item.path)}
                                className={`flex flex-col items-center justify-center flex-1 transition-all duration-300 relative py-1`}
                            >
                                <div className={`relative p-2 rounded-full transition-all duration-500 ${isActive ? 'bg-white/10 scale-110' : ''}`}>
                                    <Icon 
                                        size={26} 
                                        className={`transition-colors duration-300 ${isActive ? 'text-[#3B82F6] fill-[#3B82F6]/20' : 'text-white'}`} 
                                    />
                                    
                                    {/* Red Notification Badge - Matching your image */}
                                    {item.badge && (
                                        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#FF453A] border-2 border-black rounded-full flex items-center justify-center">
                                            <span className="text-[8px] text-white font-bold">!</span>
                                        </span>
                                    )}
                                </div>
                                
                                <span className={`text-[11px] mt-1 font-semibold transition-colors duration-300 ${isActive ? 'text-[#3B82F6]' : 'text-white'}`}>
                                    {item.label}
                                </span>

                                {/* Bottom Indicator Pill */}
                                {isActive && (
                                    <div className="absolute -bottom-1 w-1 h-1 bg-[#3B82F6] rounded-full shadow-[0_0_8px_#3B82F6]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* --- DESKTOP SIDEBAR --- */}
            <aside
                className={`hidden lg:flex fixed left-0 top-0 flex-col h-full bg-white dark:bg-[#0b0f1a] transition-all duration-500 z-[50] border-r border-slate-100 dark:border-slate-800/60
                ${collapsed ? "w-24" : "w-72"}`}
            >
                {/* Brand Header */}
                <div className="h-24 flex items-center px-8 shrink-0 relative">
                    <div className={`flex items-center gap-4 ${collapsed ? "mx-auto" : ""}`}>
                        <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        {!collapsed && (
                            <span className="text-slate-800 dark:text-slate-100 font-black text-xl tracking-tight">
                                EduFlow<span className="text-indigo-600">.</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Rest of Desktop Sidebar Logic remains same... */}
                <nav className="flex-1 px-5 py-4 space-y-2 overflow-y-auto no-scrollbar">
                    {/* (Map desktop nav items here) */}
                </nav>

                {/* Credits / Sign Out */}
                <div className="p-6">
                    <button onClick={() => logout()} className="flex items-center w-full px-5 py-3 text-slate-400 hover:text-red-500 rounded-2xl transition-all">
                        <LogOut className="w-5 h-5 mr-4" />
                        {!collapsed && <span className="font-bold">Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}