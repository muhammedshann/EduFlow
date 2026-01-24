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

    const Card = ({ children, className }) => (
        <div className={`bg-white shadow-md rounded-xl p-4 ${className}`}>{children}</div>
    );

    const Button = ({ children, className, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition ${className}`}
        >
            {children}
        </button>
    );

    const fetch = async () => {
        const HabitResponse = await dispatch(WeeklyStatsHabit()).unwrap();
        const PomodoroResponse = await dispatch(FetchDailyStats()).unwrap();
        console.log(PomodoroResponse);
        setTodayPomodoroCount(PomodoroResponse.sessions_completed)

        const todayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];
        const todayStats = HabitResponse.find(day => day.date === todayName);
        const todayPercentage = todayStats ? todayStats.completion_percent : 0;

        setTodayHabitPercentage(todayPercentage);
        const notesResponse = await dispatch(FetchNotes()).unwrap();
        setTotalNotes(notesResponse.length)
    };

    useEffect(() => {
        fetch()
    },[])

    return (
        <div className="space-y-8 p-15">
            {/* Header with Profile */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                    <div
                        className="w-16 h-16 rounded-full overflow-hidden cursor-pointer"
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
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                            Welcome back, {user ? user.username : 'Alex'}!
                        </h1>
                        <p className="text-gray-500">Ready to boost your productivity?</p>
                    </div>
                </div>

                {/* Notifications and Logout */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition" onClick={() => navigate('/notification/')}>
                            <Bell className="h-5 w-5" />

                        </button>
                    </div>

                    <button className="flex items-center gap-2 p-2 rounded-md hover:bg-dark-100 text-grey-600 font-medium transition" onClick={() => navigate('/settings/')}>
                        <Settings className="w-5 h-5" />
                    </button>
                    {/* Logout Button */}
                    <button className="flex items-center gap-2 p-2 rounded-md hover:bg-red-100 text-red-600 font-medium transition" onClick={() => logout()}>
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Today's Focus</p>
                            <p className="text-2xl font-bold">{TodayPomodoroCount}</p>
                            <p className="text-xs text-gray-500">Pomodoros</p>
                        </div>
                        <Timer className="h-8 w-8 text-purple-500" />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Habits</p>
                            <p className="text-2xl font-bold">{TodayHabitPercentage}%</p>
                            <p className="text-xs text-gray-500">This week</p>
                        </div>
                        <CheckSquare className="h-8 w-8 text-green-500" />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Credits</p>
                            <p className="text-2xl font-bold">{userCredits?.remaining_credits}</p>
                            <p className="text-xs text-gray-500">Remaining</p>
                        </div>
                        <CreditCard className="h-8 w-8 text-blue-500" />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-2xl font-bold">{TotalNotes}</p>
                            <p className="text-xs text-gray-500">Notes</p>
                        </div>
                        <Mic className="h-8 w-8 text-purple-500" />
                    </div>
                </Card>
            </div>

            {/* Main Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transcription */}
                <Card>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Mic className="h-5 w-5 mr-2 text-purple-500" />
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
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                        AI Assistant
                    </h2>
                    <div className="space-y-3">
                        <NavLink to="/chat-bot/">
                            <Button className="w-full justify-start flex items-center h-12">
                                <MessageSquare className="h-4 w-4 mr-3" />
                                Chat with AI
                            </Button>
                        </NavLink>
                        <p className="text-sm text-gray-500 mt-3">
                            Ask questions about studies.
                        </p>
                    </div>
                </Card>

                {/* Focus & Habits */}
                <Card>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Timer className="h-5 w-5 mr-2 text-green-500" />
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
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-purple-500" />
                        Community
                    </h2>
                    <div className="space-y-3">
                        <NavLink to="/groups/">
                            <Button className="w-full justify-start flex items-center h-12">
                                <Users className="h-4 w-4 mr-3" />
                                Study Groups
                            </Button>
                        </NavLink>
                        <p className="text-sm text-gray-500 mt-3">Learn with friends</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
