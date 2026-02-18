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

    // -- Reusable Card (Kept exactly as original) --
    const Card = ({ children, className }) => (
        <div className={`bg-white dark:bg-slate-800 shadow-sm md:shadow-md dark:shadow-slate-900/50 rounded-xl p-4 transition-colors duration-300 ${className}`}>
            {children}
        </div>
    );

    // -- Reusable Button (Kept exactly as original) --
    const Button = ({ children, className, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-3 md:py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-200 text-sm md:text-base ${className}`}
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
        // FIXED: Only the background class is updated here to match other pages
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 transition-colors duration-300 p-4 md:p-8 space-y-6 md:space-y-8 pb-24 md:pb-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                {/* User Info */}
                <div className="flex items-center space-x-3 md:space-x-4">
                    <div
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all flex-shrink-0"
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
                        <h1 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400 truncate">
                            Hi, {user ? user.username : 'Alex'}!
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 truncate">
                            Let's be productive today.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 bg-white dark:bg-slate-800 md:bg-transparent md:dark:bg-transparent p-2 md:p-0 rounded-xl shadow-sm md:shadow-none">
                    <div className="flex items-center gap-2">
                        <button 
                            className="p-2 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition" 
                            onClick={() => navigate('/notification/')}
                        >
                            <Bell className="h-5 w-5 md:h-6 md:w-6" />
                        </button>

                        <button 
                            className="p-2 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition" 
                            onClick={() => navigate('/settings/')}
                        >
                            <Settings className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 md:hidden"></div>
                    
                    <button 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 transition text-sm font-medium" 
                        onClick={() => logout()}
                    >
                        <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="md:inline">Logout</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">Today's Focus</p>
                            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{TodayPomodoroCount}</p>
                            <p className="text-[10px] md:text-xs text-gray-500 dark:text-slate-500">Pomodoros</p>
                        </div>
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg w-fit">
                            <Timer className="h-5 w-5 md:h-8 md:w-8 text-purple-500 dark:text-purple-400" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">Habits</p>
                            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{TodayHabitPercentage}%</p>
                            <p className="text-[10px] md:text-xs text-gray-500 dark:text-slate-500">Completed</p>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg w-fit">
                            <CheckSquare className="h-5 w-5 md:h-8 md:w-8 text-green-500 dark:text-green-400" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">Credits</p>
                            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{userCredits?.remaining_credits || 0}</p>
                            <p className="text-[10px] md:text-xs text-gray-500 dark:text-slate-500">Remaining</p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-fit">
                            <CreditCard className="h-5 w-5 md:h-8 md:w-8 text-blue-500 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">Total</p>
                            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{TotalNotes}</p>
                            <p className="text-[10px] md:text-xs text-gray-500 dark:text-slate-500">Notes</p>
                        </div>
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg w-fit">
                            <Mic className="h-5 w-5 md:h-8 md:w-8 text-purple-500 dark:text-purple-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                
                {/* Transcription */}
                <Card className="border-l-4 border-purple-500">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
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
                    <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
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
                        <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 px-1">
                            Ask questions about your studies anytime.
                        </p>
                    </div>
                </Card>

                {/* Focus & Habits */}
                <Card className="border-l-4 border-green-500">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                        <Timer className="h-5 w-5 mr-2 text-green-500" />
                        Focus & Habits
                    </h2>
                    <div className="space-y-3">
                        <NavLink to="/promodoro/" className="block">
                            <Button className="w-full justify-start flex items-center h-12 active:scale-95 transition-transform">
                                <Timer className="h-4 w-4 mr-3 text-green-500" />
                                Pomodoro Timer
                            </Button>
                        </NavLink>
                        <NavLink to="/habit-tracker/" className="block">
                            <Button className="w-full justify-start flex items-center h-12 active:scale-95 transition-transform">
                                <CheckSquare className="h-4 w-4 mr-3 text-green-500" />
                                Habit Tracker
                            </Button>
                        </NavLink>
                    </div>
                </Card>

                {/* Community */}
                <Card className="border-l-4 border-pink-500">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
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
                        <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 px-1">Connect and learn with friends.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}