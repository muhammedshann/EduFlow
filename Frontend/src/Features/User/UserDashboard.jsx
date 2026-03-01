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

    // Theme & Color-Aware Interactive Card
    const Card = ({ children, className, color = "purple" }) => {
        const borderColors = {
            purple: "hover:border-purple-300 hover:shadow-purple-500/10",
            blue: "hover:border-blue-300 hover:shadow-blue-500/10",
            green: "hover:border-green-300 hover:shadow-green-500/10",
            pink: "hover:border-pink-300 hover:shadow-pink-500/10",
        };

        return (
            <div className={`group bg-white dark:bg-[#131823] border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none transition-all duration-300 hover:-translate-y-1.5 dark:hover:border-white/10 dark:hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] ${borderColors[color]} ${className}`}>
                {children}
            </div>
        );
    };

    // Theme & Color-Aware Interactive Button
    const CardButton = ({ children, onClick, color = "purple" }) => {
        const buttonColors = {
            purple: "group-hover:bg-purple-50 group-hover:text-purple-700",
            blue: "group-hover:bg-blue-50 group-hover:text-blue-700",
            green: "group-hover:bg-green-50 group-hover:text-green-700",
            pink: "group-hover:bg-pink-50 group-hover:text-pink-700",
        };

        return (
            <button
                onClick={onClick}
                className={`w-full py-2.5 mt-auto bg-slate-50 dark:bg-[#1C2230] hover:bg-slate-100 dark:hover:bg-[#2A344A] dark:group-hover:bg-[#252C3D] dark:group-hover:text-white active:scale-95 text-slate-600 dark:text-gray-300 text-sm font-medium rounded-xl transition-all duration-200 ${buttonColors[color]}`}
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 text-slate-900 dark:text-white p-6 md:p-10 font-sans selection:bg-purple-500/30 pb-24 md:pb-10 transition-colors duration-300">
            
            {/* --- Top Header Section --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                {/* Greeting & Quote */}
                <div className="transform transition-all hover:translate-x-1 duration-300">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1.5 cursor-default text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 dark:from-gray-100 dark:to-gray-400">
                        Welcome back, {user ? user.username : 'Kingboy'}!
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-gray-400 italic font-serif cursor-default">
                        "The only way to do great work is to love what you do."
                    </p>
                </div>

                {/* Top Right Controls */}
                <div className="flex items-center justify-between md:justify-end gap-3 md:gap-5 w-full lg:w-auto">
                    {/* Notification Bell */}
                    <button 
                        className="relative p-2.5 rounded-full bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-transparent shadow-sm dark:shadow-none text-slate-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#252C3D] active:scale-90 transition-all duration-200"
                        onClick={() => navigate('/notification/')}
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-pink-500 border-2 border-white dark:border-[#1C2230] animate-pulse"></span>
                    </button>

                    {/* Settings */}
                    <button 
                        className="p-2.5 rounded-full bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-transparent shadow-sm dark:shadow-none text-slate-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#252C3D] active:scale-90 transition-all duration-200"
                        onClick={() => navigate('/settings/')}
                    >
                        <Settings className="h-5 w-5 hover:rotate-90 transition-transform duration-500" />
                    </button>

                    <div className="h-8 w-px bg-slate-300 dark:bg-white/10 hidden md:block mx-1"></div>

                    {/* Profile Picture */}
                    <div 
                        className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-white dark:border-[#1C2230] shadow-sm dark:shadow-none hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 flex-shrink-0"
                        onClick={() => navigate('/settings/')}
                    >
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                        ) : (
                            <div className="bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold w-full h-full">
                                {`${user?.firstname?.[0] || ""}${user?.lastname?.[0] || ""}`.toUpperCase() || "U"}
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <button 
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95 text-sm font-medium transition-all duration-200"
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
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-gray-500 uppercase group-hover:text-slate-700 dark:group-hover:text-gray-400 transition-colors">Today's Focus</span>
                        <div className="p-1.5 bg-green-100 dark:bg-[#172622] rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <Timer className="h-4 w-4 text-green-600 dark:text-[#4ADE80]" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-[#4ADE80] transition-colors">{TodayPomodoroCount}</div>
                        <div className="flex items-center text-xs text-green-600 dark:text-[#4ADE80]">
                            <ArrowUp className="h-3 w-3 mr-1 animate-bounce" />
                            +2 from yesterday
                        </div>
                    </div>
                </Card>

                {/* Habit Streak Stat (Purple) */}
                <Card color="purple" className="flex flex-col justify-between h-32 cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-gray-500 uppercase group-hover:text-slate-700 dark:group-hover:text-gray-400 transition-colors">Habit Streak</span>
                        <div className="p-1.5 bg-purple-100 dark:bg-[#1F1829] rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                            <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-[#A855F7]" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-[#A855F7] transition-colors">{TodayHabitPercentage}%</div>
                        <div className="w-full bg-slate-100 dark:bg-[#1C2230] rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-purple-500 to-[#A855F7] h-1.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000 ease-out" 
                                style={{ width: `${TodayHabitPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </Card>

                {/* AI Credits Stat (Blue) */}
                <Card color="blue" className="flex flex-col justify-between h-32 cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-gray-500 uppercase group-hover:text-slate-700 dark:group-hover:text-gray-400 transition-colors">AI Credits</span>
                        <div className="p-1.5 bg-blue-100 dark:bg-[#162032] rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                            <Zap className="h-4 w-4 text-blue-600 dark:text-[#3B82F6]" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-[#3B82F6] transition-colors">{userCredits?.remaining_credits || 0}</div>
                        <div className="text-xs text-slate-500 dark:text-gray-500">Pro Plan Active</div>
                    </div>
                </Card>

                {/* Total Notes Stat (Pink) */}
                <Card color="pink" className="flex flex-col justify-between h-32 cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-gray-500 uppercase group-hover:text-slate-700 dark:group-hover:text-gray-400 transition-colors">Total Notes</span>
                        <div className="p-1.5 bg-pink-100 dark:bg-[#291725] rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
                            <Notebook className="h-4 w-4 text-pink-600 dark:text-[#EC4899]" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-pink-600 dark:group-hover:text-[#EC4899] transition-colors">{TotalNotes}</div>
                        <div className="text-xs text-slate-500 dark:text-gray-500">Recorded & saved</div>
                    </div>
                </Card>
            </div>

            {/* --- Main Action Cards Grid (6 Cards) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Notebooks Card (Purple) */}
                <Card color="purple" className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-[#1B1A28] rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-purple-200 dark:group-hover:bg-[#A855F7]/20">
                            <BookOpen className="h-5 w-5 text-purple-600 dark:text-[#A855F7]" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-gray-500 uppercase transition-colors group-hover:text-purple-600 dark:group-hover:text-[#A855F7]">Smart Notes</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Notebooks</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">{TotalNotes} notes total across categories</p>
                    </div>
                    <CardButton color="purple" onClick={() => navigate('/notes/')}>Open</CardButton>
                </Card>

                {/* 2. Live/Upload Smart Note Card (Blue) */}
                <Card color="blue" className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-[#162032] rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-200 dark:group-hover:bg-[#3B82F6]/20">
                            <Mic className="h-5 w-5 text-blue-600 dark:text-[#3B82F6]" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-gray-500 uppercase transition-colors group-hover:text-blue-600 dark:group-hover:text-[#3B82F6]">Transcription</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Smart Recording</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Start live note or upload an audio file</p>
                    </div>
                    <CardButton color="blue" onClick={() => navigate('/smart-note/')}>Launch</CardButton>
                </Card>

                {/* 3. Focus Timer Card (Green) */}
                <Card color="green" className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-green-100 dark:bg-[#172622] rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-green-200 dark:group-hover:bg-[#4ADE80]/20">
                            <Timer className="h-5 w-5 text-green-600 dark:text-[#4ADE80]" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-gray-500 uppercase transition-colors group-hover:text-green-600 dark:group-hover:text-[#4ADE80]">Active Session</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Focus Timer</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Ready to start your next session</p>
                    </div>
                    <CardButton color="green" onClick={() => navigate('/promodoro/')}>Launch</CardButton>
                </Card>

                {/* 4. Habit Tracker Card (Pink) */}
                <Card color="pink" className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-pink-100 dark:bg-[#291725] rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-pink-200 dark:group-hover:bg-[#EC4899]/20">
                            <CheckCircle2 className="h-5 w-5 text-pink-600 dark:text-[#EC4899]" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-gray-500 uppercase transition-colors group-hover:text-pink-600 dark:group-hover:text-[#EC4899]">Daily Progress</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Habit Tracker</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">{TodayHabitPercentage}% completed today</p>
                    </div>
                    <CardButton color="pink" onClick={() => navigate('/habit-tracker/')}>Open</CardButton>
                </Card>

                {/* 5. AI Chat Card (Blue) */}
                <Card color="blue" className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-[#162032] rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-200 dark:group-hover:bg-[#3B82F6]/20">
                            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-[#3B82F6]" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-gray-500 uppercase transition-colors group-hover:text-blue-600 dark:group-hover:text-[#3B82F6]">AI Online</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">AI Chat</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Ready to assist with your studies</p>
                    </div>
                    <CardButton color="blue" onClick={() => navigate('/chat-bot/')}>Launch</CardButton>
                </Card>

                {/* 6. Community Groups Card (Pink) */}
                <Card color="pink" className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-pink-100 dark:bg-[#291725] rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-pink-200 dark:group-hover:bg-[#EC4899]/20">
                            <Users className="h-5 w-5 text-pink-600 dark:text-[#EC4899]" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-gray-500 uppercase transition-colors group-hover:text-pink-600 dark:group-hover:text-[#EC4899]">Active Groups</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Community Groups</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Connect and learn with friends</p>
                    </div>
                    <CardButton color="pink" onClick={() => navigate('/groups/')}>Open</CardButton>
                </Card>

            </div>
        </div>
    );
}