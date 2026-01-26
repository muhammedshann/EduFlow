import { NavLink, useNavigate } from "react-router-dom";
import {
    Mic,
    Upload,
    Timer,
    CheckSquare,
    Users,
    MessageSquare,
    Bell,
    CreditCard,
    BarChart3,
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

    // -- Reusable Card Component with Dark Mode --
    const Card = ({ children, className }) => (
        <div className={`bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-900/50 rounded-xl p-4 transition-colors duration-300 ${className}`}>
            {children}
        </div>
    );

    // -- Reusable Button Component with Dark Mode --
    const Button = ({ children, className, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-200 ${className}`}
        >
            {children}
        </button>
    );

    const fetch = async () => {
        try {
            const HabitResponse = await dispatch(WeeklyStatsHabit()).unwrap();
            const PomodoroResponse = await dispatch(FetchDailyStats()).unwrap();
            console.log(PomodoroResponse);
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
        // Main Container Background
        <div className="space-y-8 p-15 min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            
            {/* Header with Profile */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                    <div
                        className="w-16 h-16 rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all"
                        onClick={() => navigate('/settings/')}
                    >
                        {user.profilePic ? (
                            <img
                                src={user.profilePic}
                                alt={`${user.firstname} ${user.lastname}`}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <div className="bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold w-full h-full rounded-full">
                                {`${user.firstname?.[0] || ""}${user.lastname?.[0] || ""}`.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400">
                            Welcome back, {user ? user.username : 'Alex'}!
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400">Ready to boost your productivity?</p>
                    </div>
                </div>

                {/* Notifications and Logout */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button 
                            className="relative p-2 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition" 
                            onClick={() => navigate('/notification/')}
                        >
                            <Bell className="h-6 w-6" />
                        </button>
                    </div>

                    <button 
                        className="flex items-center gap-2 p-2 rounded-md text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium transition" 
                        onClick={() => navigate('/settings/')}
                    >
                        <Settings className="w-6 h-6" />
                    </button>
                    
                    {/* Logout Button */}
                    <button 
                        className="flex items-center gap-2 p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition" 
                        onClick={() => logout()}
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Today's Focus</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{TodayPomodoroCount}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-500">Pomodoros</p>
                        </div>
                        <Timer className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Habits</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{TodayHabitPercentage}%</p>
                            <p className="text-xs text-gray-500 dark:text-slate-500">This week</p>
                        </div>
                        <CheckSquare className="h-8 w-8 text-green-500 dark:text-green-400" />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Credits</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{userCredits?.remaining_credits}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-500">Remaining</p>
                        </div>
                        <CreditCard className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Total</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{TotalNotes}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-500">Notes</p>
                        </div>
                        <Mic className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                    </div>
                </Card>
            </div>

            {/* Main Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transcription */}
                <Card>
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                        <Mic className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
                        Smart Notes
                    </h2>
                    <div className="space-y-3">
                        <NavLink to="/smart-note/">
                            <Button className="w-full justify-start flex items-center h-12">
                                <Mic className="h-4 w-4 mr-3" />
                                Start Live/Upload Note
                            </Button>
                        </NavLink>
                        <NavLink to="/notes/">
                            <Button className="w-full justify-start flex items-center mt-1 h-12">
                                <Notebook className="h-4 w-4 mr-3" />
                                Notes
                            </Button>
                        </NavLink>
                    </div>
                </Card>

                {/* AI Assistant */}
                <Card>
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                        <MessageSquare className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                        AI Assistant
                    </h2>
                    <div className="space-y-3">
                        <NavLink to="/chat-bot/">
                            <Button className="w-full justify-start flex items-center h-12">
                                <MessageSquare className="h-4 w-4 mr-3" />
                                Chat with AI
                            </Button>
                        </NavLink>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-3">
                            Ask questions about studies.
                        </p>
                    </div>
                </Card>

                {/* Focus & Habits */}
                <Card>
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                        <Timer className="h-5 w-5 mr-2 text-green-500 dark:text-green-400" />
                        Focus & Habits
                    </h2>
                    <div className="space-y-3">
                        <NavLink to="/promodoro/">
                            <Button className="w-full justify-start flex items-center h-12">
                                <Timer className="h-4 w-4 mr-3" />
                                Pomodoro Timer
                            </Button>
                        </NavLink>
                        <NavLink to="/habit-tracker/">
                            <Button className="w-full justify-start flex items-center mt-1 h-12">
                                <CheckSquare className="h-4 w-4 mr-3" />
                                Habit Tracker
                            </Button>
                        </NavLink>
                    </div>
                </Card>

                {/* Community */}
                <Card>
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                        <Users className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
                        Community
                    </h2>
                    <div className="space-y-3">
                        <NavLink to="/groups/">
                            <Button className="w-full justify-start flex items-center h-12">
                                <Users className="h-4 w-4 mr-3" />
                                Study Groups
                            </Button>
                        </NavLink>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-3">Learn with friends</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}