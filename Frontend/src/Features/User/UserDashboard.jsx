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
    Notebook
} from "lucide-react";
import { useUser } from "../../Context/UserContext";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { WeeklyStatsHabit } from "../../Redux/HabitTrackerSlice";
import { FetchDailyStats } from "../../Redux/PomodoroSlice";
import { FetchNotes } from "../../Redux/LiveTranscriptionSlice";

export default function UserDashboard() {
    const [TodayHabitPercentage, setTodayHabitPercentage] = useState(0);
    const [TodayPomodoroCount, setTodayPomodoroCount] = useState(0);
    const [TotalNotes, setTotalNotes] = useState(0);
    const { userCredits } = useSelector((state) => state.subscriptions);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, logout } = useUser();

    // -- Reusable Boutique Card (Updated for Glassmorphism) --
    const Card = ({ children, className }) => (
        <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl dark:shadow-slate-900/50 rounded-2xl p-5 border border-white/20 dark:border-slate-800 transition-all duration-300 ${className}`}>
            {children}
        </div>
    );

    // -- Reusable Button (Updated for Theme Consistency) --
    const Button = ({ children, className, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-3 md:py-2.5 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 text-sm md:text-base font-medium ${className}`}
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
        // FIXED: Applied Cinematic Gradient Background
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 transition-colors duration-300 p-4 md:p-8 space-y-6 md:space-y-8 pb-24 md:pb-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                {/* User Info */}
                <div className="flex items-center space-x-3 md:space-x-4">
                    <div
                        className="w-12 h-12 md:w-16 md:h-16 rounded-2xl overflow-hidden cursor-pointer border-2 border-white/50 dark:border-slate-700 hover:border-purple-500 transition-all flex-shrink-0 shadow-lg"
                        onClick={() => navigate('/settings/')}
                    >
                        {user.profilePic ? (
                            <img
                                src={user.profilePic}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm md:text-lg font-bold w-full h-full">
                                {`${user.firstname?.[0] || ""}${user.lastname?.[0] || ""}`.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0"> 
                        <h1 className="text-xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight truncate">
                            Hi, {user ? user.username : 'Alex'}!
                        </h1>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 truncate font-medium">
                            Let's be productive today.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md md:bg-transparent md:dark:bg-transparent p-2 md:p-0 rounded-2xl shadow-sm md:shadow-none border border-white/20 md:border-none">
                    <div className="flex items-center gap-2">
                        <button 
                            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-600" 
                            onClick={() => navigate('/notification/')}
                        >
                            <Bell className="h-5 w-5 md:h-6 md:w-6" />
                        </button>

                        <button 
                            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-600" 
                            onClick={() => navigate('/settings/')}
                        >
                            <Settings className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </div>

                    {/* Separator for mobile */}
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 md:hidden"></div>
                    
                    <button 
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition text-sm font-bold border border-transparent hover:border-red-200 dark:hover:border-red-800" 
                        onClick={() => logout()}
                    >
                        <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="md:inline">Logout</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                            <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Focus</p>
                            <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">{TodayPomodoroCount}</p>
                            <p className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500">Sessions</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl w-fit border border-purple-100 dark:border-purple-500/20">
                            <Timer className="h-5 w-5 md:h-8 md:w-8 text-purple-500 dark:text-purple-400" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                            <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Habits</p>
                            <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">{TodayHabitPercentage}%</p>
                            <p className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500">Completed</p>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl w-fit border border-emerald-100 dark:border-emerald-500/20">
                            <CheckSquare className="h-5 w-5 md:h-8 md:w-8 text-emerald-500 dark:text-emerald-400" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                            <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Credits</p>
                            <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">{userCredits?.remaining_credits || 0}</p>
                            <p className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500">Tokens</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl w-fit border border-blue-100 dark:border-blue-500/20">
                            <CreditCard className="h-5 w-5 md:h-8 md:w-8 text-blue-500 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                            <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</p>
                            <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">{TotalNotes}</p>
                            <p className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500">Notes</p>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl w-fit border border-indigo-100 dark:border-indigo-500/20">
                            <Mic className="h-5 w-5 md:h-8 md:w-8 text-indigo-500 dark:text-indigo-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                
                {/* Transcription */}
                <Card className="border-l-4 border-purple-500">
                    <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center text-slate-800 dark:text-white tracking-tight">
                        <Mic className="h-5 w-5 mr-2 text-purple-500" />
                        Smart Notes
                    </h2>
                    <div className="space-y-3">
                        <NavLink to="/smart-note/" className="block">
                            <Button className="w-full justify-start flex items-center h-12 md:h-12 active:scale-95 transition-transform">
                                <Mic className="h-4 w-4 mr-3 text-purple-500" />
                                Start Live/Upload Note
                            </Button>
                        </NavLink>
                        <NavLink to="/notes/" className="block">
                            <Button className="w-full justify-start flex items-center h-12 md:h-12 active:scale-95 transition-transform">
                                <Notebook className="h-4 w-4 mr-3 text-purple-500" />
                                My Notebooks
                            </Button>
                        </NavLink>
                    </div>
                </Card>

                {/* AI Assistant */}
                <Card className="border-l-4 border-blue-500">
                    <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center text-slate-800 dark:text-white tracking-tight">
                        <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                        AI Assistant
                    </h2>
                    <div className="space-y-3">
                        <NavLink to="/chat-bot/" className="block">
                            <Button className="w-full justify-start flex items-center h-12 active:scale-95 transition-transform">
                                <MessageSquare className="h-4 w-4 mr-3 text-blue-500" />
                                Chat with AI
                            </Button>
                        </NavLink>
                        <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 px-1">
                            Ask questions about your studies anytime.
                        </p>
                    </div>
                </Card>

                {/* Focus & Habits */}
                <Card className="border-l-4 border-emerald-500">
                    <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center text-slate-800 dark:text-white tracking-tight">
                        <Timer className="h-5 w-5 mr-2 text-emerald-500" />
                        Focus & Habits
                    </h2>
                    <div className="space-y-3">
                        <NavLink to="/promodoro/" className="block">
                            <Button className="w-full justify-start flex items-center h-12 active:scale-95 transition-transform">
                                <Timer className="h-4 w-4 mr-3 text-emerald-500" />
                                Pomodoro Timer
                            </Button>
                        </NavLink>
                        <NavLink to="/habit-tracker/" className="block">
                            <Button className="w-full justify-start flex items-center h-12 active:scale-95 transition-transform">
                                <CheckSquare className="h-4 w-4 mr-3 text-emerald-500" />
                                Habit Tracker
                            </Button>
                        </NavLink>
                    </div>
                </Card>

                {/* Community */}
                <Card className="border-l-4 border-pink-500">
                    <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center text-slate-800 dark:text-white tracking-tight">
                        <Users className="h-5 w-5 mr-2 text-pink-500" />
                        Community
                    </h2>
                    <div className="space-y-3">
                        <NavLink to="/groups/" className="block">
                            <Button className="w-full justify-start flex items-center h-12 active:scale-95 transition-transform">
                                <Users className="h-4 w-4 mr-3 text-pink-500" />
                                Study Groups
                            </Button>
                        </NavLink>
                        <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 px-1">Connect and learn with friends.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}