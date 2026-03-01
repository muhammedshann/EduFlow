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
    Search,
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

    // Enhanced Interactive Card Component
    const Card = ({ children, className }) => (
        <div className={`group bg-[#131823] border border-white/5 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/10 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] ${className}`}>
            {children}
        </div>
    );

    // Enhanced Interactive Button Component
    const CardButton = ({ children, onClick }) => (
        <button
            onClick={onClick}
            className="w-full py-2.5 mt-auto bg-[#1C2230] hover:bg-[#2A344A] group-hover:bg-[#252C3D] group-hover:text-white active:scale-95 text-gray-300 text-sm font-medium rounded-xl transition-all duration-200"
        >
            {children}
        </button>
    );

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
        <div className="min-h-screen bg-[#0B0F19] text-white p-6 md:p-10 font-sans selection:bg-purple-500/30">
            
            {/* --- Top Header Section --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                {/* Greeting & Quote */}
                <div className="transform transition-all hover:translate-x-1 duration-300">
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-1.5 cursor-default">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">{user ? user.username : 'Alex'}</span>!
                    </h1>
                    <p className="text-sm text-gray-400 italic font-serif cursor-default">
                        "The only way to do great work is to love what you do."
                    </p>
                </div>

                {/* Top Right Controls */}
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Search Bar */}
                    <div className="relative hidden md:block w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 transition-colors group-focus-within:text-purple-500" />
                        <input 
                            type="text" 
                            placeholder="Search notes..." 
                            className="w-full bg-[#1C2230] text-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none border border-transparent focus:border-purple-500/50 focus:bg-[#131823] focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 placeholder-gray-500"
                        />
                    </div>

                    {/* Notification Bell */}
                    <button 
                        className="relative p-2.5 rounded-full bg-[#1C2230] text-gray-400 hover:text-white hover:bg-[#252C3D] active:scale-90 transition-all duration-200"
                        onClick={() => navigate('/notification/')}
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-pink-500 border-2 border-[#1C2230] animate-pulse"></span>
                    </button>

                    {/* Profile Picture */}
                    <div 
                        className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-[#1C2230] hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 flex-shrink-0"
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
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 text-sm font-medium transition-all duration-200"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </div>

            {/* --- Stats Row --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Focus Stat */}
                <Card className="flex flex-col justify-between h-32 cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase group-hover:text-gray-400 transition-colors">Today's Focus</span>
                        <div className="p-1.5 bg-[#172622] rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <Timer className="h-4 w-4 text-[#4ADE80]" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-1 group-hover:text-[#4ADE80] transition-colors">{TodayPomodoroCount}</div>
                        <div className="flex items-center text-xs text-[#4ADE80]">
                            <ArrowUp className="h-3 w-3 mr-1 animate-bounce" />
                            +2 from yesterday
                        </div>
                    </div>
                </Card>

                {/* Habit Streak Stat */}
                <Card className="flex flex-col justify-between h-32 cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase group-hover:text-gray-400 transition-colors">Habit Streak</span>
                        <div className="p-1.5 bg-[#1F1829] rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                            <CheckCircle2 className="h-4 w-4 text-[#A855F7]" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-2 group-hover:text-[#A855F7] transition-colors">{TodayHabitPercentage}%</div>
                        <div className="w-full bg-[#1C2230] rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-purple-600 to-[#A855F7] h-1.5 rounded-full shadow-[0_0_10px_#A855F7] transition-all duration-1000 ease-out" 
                                style={{ width: `${TodayHabitPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </Card>

                {/* AI Credits Stat */}
                <Card className="flex flex-col justify-between h-32 cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase group-hover:text-gray-400 transition-colors">AI Credits</span>
                        <div className="p-1.5 bg-[#162032] rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                            <Zap className="h-4 w-4 text-[#3B82F6]" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-1 group-hover:text-[#3B82F6] transition-colors">{userCredits?.remaining_credits || 0}</div>
                        <div className="text-xs text-gray-500">Pro Plan Active</div>
                    </div>
                </Card>

                {/* Total Notes Stat */}
                <Card className="flex flex-col justify-between h-32 cursor-default">
                    <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase group-hover:text-gray-400 transition-colors">Total Notes</span>
                        <div className="p-1.5 bg-[#291725] rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
                            <Notebook className="h-4 w-4 text-[#EC4899]" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-1 group-hover:text-[#EC4899] transition-colors">{TotalNotes}</div>
                        <div className="text-xs text-gray-500">3 new this week</div>
                    </div>
                </Card>
            </div>

            {/* --- Action Cards Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Notebooks Card */}
                <Card className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-[#1B1A28] rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#A855F7]/20">
                            <BookOpen className="h-5 w-5 text-[#A855F7]" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase transition-colors group-hover:text-[#A855F7]">Smart Notes</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-semibold text-white mb-1">Notebooks</h3>
                        <p className="text-sm text-gray-400">{TotalNotes} notes total across categories</p>
                    </div>
                    <CardButton onClick={() => navigate('/notes/')}>Open</CardButton>
                </Card>

                {/* Focus Timer Card */}
                <Card className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-[#172622] rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#4ADE80]/20">
                            <Timer className="h-5 w-5 text-[#4ADE80]" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase transition-colors group-hover:text-[#4ADE80]">Active Session</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-semibold text-white mb-1">Focus Timer</h3>
                        <p className="text-sm text-gray-400">Ready to start your next session</p>
                    </div>
                    <CardButton onClick={() => navigate('/promodoro/')}>Launch</CardButton>
                </Card>

                {/* Habit Tracker Card */}
                <Card className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-[#291725] rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#EC4899]/20">
                            <CheckCircle2 className="h-5 w-5 text-[#EC4899]" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase transition-colors group-hover:text-[#EC4899]">Daily Progress</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-semibold text-white mb-1">Habit Tracker</h3>
                        <p className="text-sm text-gray-400">{TodayHabitPercentage}% completed today</p>
                    </div>
                    <CardButton onClick={() => navigate('/habit-tracker/')}>Open</CardButton>
                </Card>

                {/* AI Chat Card */}
                <Card className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-[#162032] rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#3B82F6]/20">
                            <Zap className="h-5 w-5 text-[#3B82F6]" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase transition-colors group-hover:text-[#3B82F6]">AI Online</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-semibold text-white mb-1">AI Chat</h3>
                        <p className="text-sm text-gray-400">Ready to assist with your notes</p>
                    </div>
                    <CardButton onClick={() => navigate('/chat-bot/')}>Launch</CardButton>
                </Card>

                {/* Community Groups Card */}
                <Card className="flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="p-2 bg-[#291725] rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#EC4899]/20">
                            <Users className="h-5 w-5 text-[#EC4899]" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase transition-colors group-hover:text-[#EC4899]">Active Groups</span>
                    </div>
                    <div className="mb-4 transform transition-transform duration-300 group-hover:translate-x-1">
                        <h3 className="text-lg font-semibold text-white mb-1">Community Groups</h3>
                        <p className="text-sm text-gray-400">Connect with members active in study groups</p>
                    </div>
                    <CardButton onClick={() => navigate('/groups/')}>Open</CardButton>
                </Card>

            </div>
        </div>
    );
}