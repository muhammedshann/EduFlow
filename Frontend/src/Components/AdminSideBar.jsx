import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Menu,
    X,
    Sparkles,
    LogOut,
    WalletCards,
    User,
    Star,
    BadgeCheck,
    UsersRound,
    Wallet,
    Bell,
    AudioLines,
    Clock,
    CalendarDays,
    Receipt, // Added Receipt icon back to the imports
} from "lucide-react";
// Assuming these context imports are correctly set up in your project
import { useUser } from "../Context/UserContext"; 
import { useSidebar } from "../Context/SideBarContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminSidebar() {
    const location = useLocation();
    // The selected state should store the full path for accurate comparison
    const [selected, setSelected] = useState(location.pathname);
    const { collapsed, toggleSidebar } = useSidebar();
    const navigate = useNavigate();
    const { logout } = useUser();
    
    // NOTE: Paths are prefixed with '/admin' here for accurate matching against location.pathname
    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: '/admin/dashboard' },
        { label: "User Management", icon: User, path: '/admin/user' },
        { label: "Groups Management", icon: UsersRound, path: '/admin/group/' },
        { label: "Pomodoro Management", icon: Clock, path: '/admin/pomodoro/' },
        { label: "Habit Management", icon: CalendarDays, path: '/admin/habit/' },
        { label: "Subscription Management", icon: BadgeCheck, path: '/admin/subscription' },
        { label: "Review Management", icon: Star, path: '/admin/review' },
        { label: "Transaction Management", icon: Receipt, path: '/admin/transaction' },
        { label: "Wallet Management", icon: WalletCards, path: '/admin/wallet/' },
        { label: "Notification Management", icon: Bell, path: '/admin/notification' },
        { label: "Transcription Management", icon: AudioLines, path: '/admin/transcription' },
    ];

    // Update selected path when URL changes
    useEffect(() => {
        setSelected(location.pathname);
    }, [location.pathname]);

    // Handle navigation logic
    const HandlePages = (path) => {
        // Set selected to the new path and navigate
        setSelected(path);
        navigate(path);
    }

    return (
        <aside
            className={`fixed left-0 top-0 flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-40
                ${collapsed ? "w-20" : "w-72"}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-900 font-bold text-lg">EduFlow</span>
                    </div>
                )}

                <button
                    className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 ${collapsed ? 'mx-auto' : ''}`}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    onClick={toggleSidebar}
                >
                    {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    // Check if the current location starts with the item's path (for nested routes)
                    const isActive = selected.startsWith(item.path) && (item.path !== '/admin/dashboard' || selected === item.path);
                    const Icon = item.icon;
                    
                    return (
                        <button
                            key={item.label}
                            onClick={() => HandlePages(item.path)}
                            className={`group flex items-center w-full px-3 py-3 rounded-xl transition-all duration-200 relative
                                ${isActive
                                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 font-semibold"
                                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                }
                            `}
                        >
                            {/* Active Indicator Bar */}
                            {isActive && (
                                <div className="absolute left-0 w-1 h-full bg-indigo-600 rounded-r-full -ml-3" />
                            )}

                            {/* Icon */}
                            <Icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'}`} />

                            {/* Label */}
                            {!collapsed && (
                                <span className="truncate">{item.label}</span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {collapsed && (
                                <div className="absolute left-full ml-6 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                                    {item.label}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Logout Section */}
            <div className="p-4 pt-5 border-t border-gray-200">
                <div>
                    {collapsed ? (
                        <div className="flex flex-col items-center justify-between space-y-3">
                            <button
                                onClick={() => logout()}
                                className="p-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 group"
                                aria-label="Logout"
                            >
                                {/* Set red text explicitly for collapsed logout */}
                                <LogOut className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => logout()}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Logout
                        </button>
                    )}
                </div>

            </div>
        </aside>
    );
}