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
    BookOpen,
    Zap,
    CheckCircle2,
    ArrowUp
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

    // Glassmorphism Card matching the Blue Grade
    const Card = ({ children, className, color = "purple" }) => {
        const borderColors = {
            purple: "hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20",
            blue: "hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20",
            green: "hover:border-green-300 dark:hover:border-green-500/50 hover:shadow-green-500/10 dark:hover:shadow-green-500/20",
            pink: "hover:border-pink-300 dark:hover:border-pink-500/50 hover:shadow-pink-500/10 dark:hover:shadow-pink-500/20",
        };

        return (
            <div className={`group bg-white dark:bg-slate-800/60 dark:backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none transition-all duration-300 hover:-translate-y-1.5 dark:hover:border-white/10 ${borderColors[color]} ${className}`}>
                {children}
            </div>
        );
    };

    // Color-Aware Button for Dark/Light mode
    const CardButton = ({ children, onClick, color = "purple" }) => {
        const buttonColors = {
            purple: "group-hover:bg-purple-50 dark:group-hover:bg-purple-500/20 group-hover:text-purple-700 dark:group-hover:text-purple-300",
            blue: "group-hover:bg-blue-50 dark:group-hover:bg-blue-500/20 group-hover:text-blue-700 dark:group-hover:text-blue-300",
            green: "group-hover:bg-green-50 dark:group-hover:bg-green-500/20 group-hover:text-green-700 dark:group-hover:text-green-300",
            pink: "group-hover:bg-pink-50 dark:group-hover:bg-pink-500/20 group-hover:text-pink-700 dark:group-hover:text-pink-300",
        };

        return (
            <button
                onClick={onClick}
                className={`w-full py-2.5 mt-auto bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-600/50 active:scale-95 text-slate-600 dark:text-gray-300 text-sm font-medium rounded-xl transition-all duration-200 ${buttonColors[color]}`}
            >
                {children}
            </button>
        );
    };

    const fetch = async () => {
        try {
            const HabitResponse = await dispatch(WeeklyStatsHabit()).unwrap();
            const PomodoroResponse = await dispatch(FetchDailyStats()).unwrap();
            setTodayPomodoroCount(PomodoroResponse.sessions_completed);

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
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/40 text-slate-900 dark:text-white p-6 md:p-10 font-sans selection:bg-purple-500/30 pb-24 md:pb-10 transition-colors duration-300">
            
            {/* --- Top Header Section --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                {/* Greeting & Quote */}
                <div className="transform transition-all hover:translate-x-1 duration-300">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1.5 cursor-default text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 dark:from-blue-200 dark:to-indigo-300">
                        Welcome back, {user ? user.username : 'Kingboy'}!
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-blue-200/60 italic font-serif cursor-default">
                        "The only way to do great work is to love what you do."
                    </p>
                </div>

                {/* Top Right Controls */}
                <div className="flex items-center justify-between md:justify-end gap-3 md:gap-5 w-full lg:w-auto">
                    {/* Notification Bell */}
                    <button 
                        className="relative p-2.5 rounded-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none text-slate-600 dark:text-blue-200/80 hover:text-purple-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-90 transition-all duration-200"
                        onClick={() => navigate('/notification/')}
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-pink-500 border-2 border-white dark:border-slate-800 animate-pulse"></span>
                    </button>

                    {/* Settings */}
                    <button 
                        className="p-2.5 rounded-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none text-slate-600 dark:text-blue-200/80 hover:text-purple-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-90 transition-all duration-200"
                        onClick={() => navigate('/settings/')}
                    >
                        <Settings className="h-5 w-5 hover:rotate-90 transition-transform duration-500" />
                    </button>

                    <div className="h-8 w-px bg-slate-300 dark:bg-white/10 hidden md:block mx-1"></div>

                    {/* Profile Picture */}
                    <div 
                        className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-white dark:border-slate-700 shadow-sm dark:shadow-none hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 flex-shrink-0"
                        onClick={() => navigate('/settings/')}
                    >
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                        ) : (
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold w-full h-full">
                                {`${user?.firstname?.[0] || ""}${user?.lastname?.[0] || ""}`.toUpperCase() || "U"}
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <button 
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 dark:text-blue-200/80 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95 text-sm font-medium transition-all duration-200"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </div>

            {/* --- Stats Row --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Focus Stat (Green) */}
                <Card color="green" className="flex flex-col justify-between h-32 cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Today's Focus</span>
                        <div className="p-1.5 bg-green-100 dark:bg-green-500/10 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <Timer className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{TodayPomodoroCount}</div>
                        <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                            <ArrowUp className="h-3 w-3 mr-1 animate-bounce" />
                            +2 from yesterday
                        </div>
                    </div>
                </Card>

                {/* Habit Streak Stat (Purple) */}
                <Card color="purple" className="flex flex-col justify-between h-32 cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Habit Streak</span>
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-500/10 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                            <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{TodayHabitPercentage}%</div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000 ease-out" 
                                style={{ width: `${TodayHabitPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </Card>

                {/* AI Credits Stat (Blue) */}
                <Card color="blue" className="flex flex-col justify-between h-32 cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">AI Credits</span>
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-500/10 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{userCredits?.remaining_credits || 0}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Pro Plan Active</div>
                    </div>
                </Card>

                {/* Total Notes Stat (Pink) */}
                <Card color="pink" className="flex flex-col justify-between h-32 cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Total Notes</span>
                        <div className="p-1.5 bg-pink-100 dark:bg-pink-500/10 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
                            <Notebook className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">{TotalNotes}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Recorded & saved</div>
                    </div>
                </Card>
            </div>

            {/* --- Main Action Cards Grid (6 Cards) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Notebooks Card (Purple) */}
                <Card color="purple" className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20">
                            <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">Smart Notes</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Notebooks</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{TotalNotes} notes total across categories</p>
                    </div>
                    <CardButton color="purple" onClick={() => navigate('/notes/')}>Open</CardButton>
                </Card>

                {/* 2. Live/Upload Smart Note Card (Blue) */}
                <Card color="blue" className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/20">
                            <Mic className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">Transcription</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Smart Recording</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Start live note or upload an audio file</p>
                    </div>
                    <CardButton color="blue" onClick={() => navigate('/smart-note/')}>Launch</CardButton>
                </Card>

                {/* 3. Focus Timer Card (Green) */}
                <Card color="green" className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-green-200 dark:group-hover:bg-green-500/20">
                            <Timer className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase transition-colors group-hover:text-green-600 dark:group-hover:text-green-400">Active Session</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Focus Timer</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Ready to start your next session</p>
                    </div>
                    <CardButton color="green" onClick={() => navigate('/promodoro/')}>Launch</CardButton>
                </Card>

                {/* 4. Habit Tracker Card (Pink) */}
                <Card color="pink" className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-pink-100 dark:bg-pink-500/10 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-pink-200 dark:group-hover:bg-pink-500/20">
                            <CheckCircle2 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase transition-colors group-hover:text-pink-600 dark:group-hover:text-pink-400">Daily Progress</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Habit Tracker</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{TodayHabitPercentage}% completed today</p>
                    </div>
                    <CardButton color="pink" onClick={() => navigate('/habit-tracker/')}>Open</CardButton>
                </Card>

                {/* 5. AI Chat Card (Blue) */}
                <Card color="blue" className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/20">
                            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">AI Online</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">AI Chat</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Ready to assist with your studies</p>
                    </div>
                    <CardButton color="blue" onClick={() => navigate('/chat-bot/')}>Launch</CardButton>
                </Card>

                {/* 6. Community Groups Card (Pink) */}
                <Card color="pink" className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-pink-100 dark:bg-pink-500/10 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-pink-200 dark:group-hover:bg-pink-500/20">
                            <Users className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase transition-colors group-hover:text-pink-600 dark:group-hover:text-pink-400">Active Groups</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Community Groups</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Connect and learn with friends</p>
                    </div>
                    <CardButton color="pink" onClick={() => navigate('/groups/')}>Open</CardButton>
                </Card>

            </div>
        </div>
    );
}