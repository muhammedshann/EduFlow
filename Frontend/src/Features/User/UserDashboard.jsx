import { NavLink, useNavigate } from "react-router-dom";
import {
    Mic,
    Timer,
    CheckSquare,
    Users,
    MessageSquare,
    Bell,
    CreditCard,
    LogOut,
    Settings,
    Notebook,
    Sparkles
} from "lucide-react";
import { useUser } from "../../Context/UserContext";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { WeeklyStatsHabit } from "../../Redux/HabitTrackerSlice";
import { FetchDailyStats } from "../../Redux/PomodoroSlice";
import { FetchNotes } from "../../Redux/LiveTranscriptionSlice";
import { motion } from "framer-motion";

export default function UserDashboard() {
    const [TodayHabitPercentage, setTodayHabitPercentage] = useState(0);
    const [TodayPomodoroCount, setTodayPomodoroCount] = useState(0);
    const [TotalNotes, setTotalNotes] = useState(0);
    const { userCredits } = useSelector((state) => state.subscriptions);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, logout } = useUser();

    // Cinematic Constants
    const SOFT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20";
    const CARD_BG = "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl";
    const BORDER_COLOR = "border-slate-200 dark:border-slate-800";

    // -- Reusable Boutique Card --
    const Card = ({ children, className }) => (
        <div className={`${CARD_BG} border ${BORDER_COLOR} shadow-xl rounded-[2rem] p-6 transition-all duration-300 ${className}`}>
            {children}
        </div>
    );

    // -- Reusable iOS Style Button --
    const Button = ({ children, className, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border ${BORDER_COLOR} transition-all duration-200 text-sm font-bold tracking-tight ${className}`}
        >
            {children}
        </button>
    );

    const fetch = async () => {
        try {
            const HabitResponse = await dispatch(WeeklyStatsHabit()).unwrap();
            const PomodoroResponse = await dispatch(FetchDailyStats()).unwrap();
            setTodayPomodoroCount(PomodoroResponse.sessions_completed)

            const todayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
            const todayStats = HabitResponse.find(day => day.date === todayName);
            const todayPercentage = todayStats ? todayStats.completion_percent : 0;

            setTodayHabitPercentage(todayPercentage);
            const notesResponse = await dispatch(FetchNotes()).unwrap();
            setTotalNotes(notesResponse.length);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    return (
        <div className={`min-h-screen ${SOFT_BG} transition-colors duration-300 p-4 md:p-10 space-y-8 pb-32`}>
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                    <div
                        className="w-16 h-16 rounded-[1.5rem] overflow-hidden cursor-pointer border-2 border-white/20 shadow-2xl hover:scale-105 transition-all flex-shrink-0"
                        onClick={() => navigate('/settings/')}
                    >
                        {user.profilePic ? (
                            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xl font-black w-full h-full">
                                {`${user.firstname?.[0] || ""}${user.lastname?.[0] || ""}`.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
                            Hi, {user ? user.username : 'Shan'}<span className="text-indigo-600">.</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Ready for a productive day?</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border ${BORDER_COLOR} text-slate-400 hover:text-indigo-500 transition-all" onClick={() => navigate('/notification/')}>
                        <Bell size={20} />
                    </button>
                    <button className="p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border ${BORDER_COLOR} text-slate-400 hover:text-indigo-500 transition-all" onClick={() => navigate('/settings/')}>
                        <Settings size={20} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 rounded-2xl text-rose-500 font-black text-xs uppercase tracking-widest bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 transition-all" onClick={() => logout()}>
                        <LogOut size={16} />
                        <span>Exit</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Focus", val: TodayPomodoroCount, unit: "Sessions", icon: Timer, color: "text-purple-500", bg: "dark:bg-purple-500/10" },
                    { label: "Habits", val: `${TodayHabitPercentage}%`, unit: "Completed", icon: CheckSquare, color: "text-emerald-500", bg: "dark:bg-emerald-500/10" },
                    { label: "Credits", val: userCredits?.remaining_credits || 0, unit: "Tokens", icon: CreditCard, color: "text-blue-500", bg: "dark:bg-blue-500/10" },
                    { label: "Total", val: TotalNotes, unit: "Notes", icon: Mic, color: "text-indigo-500", bg: "dark:bg-indigo-500/10" },
                ].map((stat, i) => (
                    <Card key={i}>
                        <div className="flex flex-col gap-4">
                            <div className={`p-3 rounded-2xl w-fit ${stat.bg} ${stat.color} border ${BORDER_COLOR}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white">{stat.val}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{stat.unit}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Smart Notes */}
                <Card className="border-t-4 border-t-purple-600">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600"><Mic size={20}/></div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight text-lg md:text-xl">Smart Notes</h2>
                    </div>
                    <div className="space-y-3">
                        <NavLink to="/smart-note/" className="block">
                            <Button className="w-full justify-start gap-3 active:scale-95 transition-all">
                                <Sparkles size={16} className="text-purple-500" /> Start New Session
                            </Button>
                        </NavLink>
                        <NavLink to="/notes/" className="block">
                            <Button className="w-full justify-start gap-3 active:scale-95 transition-all">
                                <Notebook size={16} className="text-purple-500" /> Access Notebooks
                            </Button>
                        </NavLink>
                    </div>
                </Card>

                {/* AI Assistant */}
                <Card className="border-t-4 border-t-blue-600">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600"><MessageSquare size={20}/></div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">AI Assistant</h2>
                    </div>
                    <div className="space-y-4">
                        <NavLink to="/chat-bot/" className="block">
                            <Button className="w-full justify-start gap-3 active:scale-95 transition-all">
                                <MessageSquare size={16} className="text-blue-500" /> Chat with AI
                            </Button>
                        </NavLink>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 leading-relaxed">Personal tutor available 24/7</p>
                    </div>
                </Card>

                {/* Focus & Habits */}
                <Card className="border-t-4 border-t-emerald-600">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600"><Timer size={20}/></div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight text-lg md:text-xl">Productivity</h2>
                    </div>
                    <div className="space-y-3">
                        <NavLink to="/promodoro/" className="block">
                            <Button className="w-full justify-start gap-3 active:scale-95 transition-all">
                                <Timer size={16} className="text-emerald-500" /> Pomodoro Timer
                            </Button>
                        </NavLink>
                        <NavLink to="/habit-tracker/" className="block">
                            <Button className="w-full justify-start gap-3 active:scale-95 transition-all">
                                <CheckSquare size={16} className="text-emerald-500" /> Daily Habits
                            </Button>
                        </NavLink>
                    </div>
                </Card>

                {/* Community */}
                <Card className="border-t-4 border-t-pink-600">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-pink-500/10 rounded-xl text-pink-600"><Users size={20}/></div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Communities</h2>
                    </div>
                    <div className="space-y-4">
                        <NavLink to="/groups/" className="block">
                            <Button className="w-full justify-start gap-3 active:scale-95 transition-all">
                                <Users size={16} className="text-pink-500" /> Study Groups
                            </Button>
                        </NavLink>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 leading-relaxed">Learn faster together</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}