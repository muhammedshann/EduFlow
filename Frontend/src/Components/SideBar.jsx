import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Mic,
    Upload,
    MessageSquare,
    Timer,
    Calendar,
    Users,
    FileText,
    Settings,
    Menu,
    X,
    Sparkles,
    LogOut,
    Wallet
} from "lucide-react";
import { useUser } from "../Context/UserContext";
import { useSidebar } from "../Context/SideBarContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
    const location = useLocation();
    const [selected, setSelected] = useState(location.pathname);
    const {collapsed , toggleSidebar} = useSidebar();
    const navigate = useNavigate();
    const { logout } = useUser();
    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, path:'/dashboard' },
        { label: "Live Transcription", icon: Mic, path:'/live-transcription/' },
        { label: "Upload Transcription", icon: Upload },
        { label: "Chat", icon: MessageSquare },
        { label: "Pomodoro", icon: Timer, path:'/promodoro/' },
        { label: "Habit Tracker", icon: Calendar, path:'/habit-tracker/' },
        { label: "Groups", icon: Users, path:'/groups/' },
        { label: "Notes", icon: FileText, path:'/notes/'},
        { label: "Wallet", icon: Wallet, path:'/wallet/' },
        { label: "Settings", icon: Settings, path:'/settings/' },
    ];
    useEffect(() => {
        setSelected(location.pathname);
    }, [location.pathname]);

    const HandlePages = ({label,path}) => {
        setSelected(label);
        navigate(path)
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
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    onClick={toggleSidebar}
                >
                    {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = selected === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => HandlePages({'label':item.label,'path':item.path})}
                            className={`group flex items-center w-full px-3 py-3 rounded-xl transition-all duration-200 relative
                ${isActive
                                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 font-semibold"
                                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                }
              `}
                        >
                            {isActive && (
                                <div className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full -ml-3" />
                            )}

                            <Icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'}`} />

                            {!collapsed && (
                                <span className="truncate">{item.label}</span>
                            )}

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

            {/* Credits Section */}
            <div className="p-4 pt-5 border-t border-gray-200">
                <div
                    className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 transition-all duration-300 overflow-hidden
                ${collapsed ? "p-3" : "p-4"}`}>
                    {collapsed ? (
                        <div className="flex flex-col items-center justify-between space-y-3">
                            <div className="flex flex-col items-center">
                                {/* <Sparkles className="w-6 h-6 text-indigo-600 mb-1" /> */}
                                <div className="text-lg font-bold text-gray-900">247</div>
                            </div>

                            <button
                                onClick={() => logout()}
                                className="p-2 bg-red hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
                                aria-label="Logout"
                            >
                                <LogOut className="w-5 h-5 text-red-600" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-700 font-medium">Credits</span>
                                <Sparkles className="w-4 h-4 text-indigo-600" />
                            </div>

                            <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-3xl font-bold text-gray-900">247</span>
                                <span className="text-gray-600 text-sm">remaining</span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: "65%" }}
                                />
                            </div>

                            <button
                                onClick={() => logout()}
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>

            </div>
        </aside>
    );
}