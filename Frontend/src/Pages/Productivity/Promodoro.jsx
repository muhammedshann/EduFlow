import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Settings, Clock, TrendingUp, CheckCircle } from "lucide-react";
import Sidebar from "../../Components/SideBar";

export default function Pomodoro() {
    const [workMinutes, setWorkMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [currentCycle, setCurrentCycle] = useState(1);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        let interval;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (isBreak) {
                setIsBreak(false);
                setTimeLeft(workMinutes * 60);
                setCurrentCycle(prev => prev + 1);
            } else {
                setSessionsCompleted(prev => prev + 1);
                setIsBreak(true);
                setTimeLeft(breakMinutes * 60);
            }
            setIsActive(false);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, isBreak, workMinutes, breakMinutes]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsBreak(false);
        setTimeLeft(workMinutes * 60);
    };

    const saveSettings = () => {
        if (!isActive) {
            setTimeLeft(isBreak ? breakMinutes * 60 : workMinutes * 60);
        }
        setIsSettingsOpen(false);
    };

    const formatTime = seconds => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        const totalTime = isBreak ? breakMinutes * 60 : workMinutes * 60;
        return ((totalTime - timeLeft) / totalTime) * 100;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
            <Sidebar className="w-full md:w-64 flex-shrink-0" />
            <div className="flex-1 w-full max-w-6xl mx-auto p-4 pb-16">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                        Pomodoro Timer
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Boost your productivity with focused work sessions
                    </p>
                </div>

                {/* Main Timer Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 mt-8">
                    <div className="flex flex-col items-center space-y-8">

                        {/* Status Badge */}
                        <div className={`px-6 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${isBreak
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-indigo-100 text-indigo-700'
                            }`}>
                            {isBreak ? '☕ Break Time' : '🎯 Focus Session'} · Cycle {currentCycle}
                        </div>

                        {/* Circular Timer */}
                        <div className="relative">
                            <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 200 200">
                                {/* Background Circle */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    stroke="#E2E8F0"
                                    strokeWidth="8"
                                    fill="transparent"
                                />
                                {/* Progress Circle */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    stroke={isBreak ? "#10B981" : "#6366F1"}
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 90}
                                    strokeDashoffset={2 * Math.PI * 90 * (1 - getProgress() / 100)}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-linear"
                                />
                                {/* Glow Effect */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    stroke={isBreak ? "#10B981" : "#6366F1"}
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 90}
                                    strokeDashoffset={2 * Math.PI * 90 * (1 - getProgress() / 100)}
                                    strokeLinecap="round"
                                    className="opacity-20 blur-lg transition-all duration-1000 ease-linear"
                                />
                            </svg>

                            {/* Time Display */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-7xl font-extralight tracking-tight text-slate-800">
                                    {formatTime(timeLeft)}
                                </span>
                                <span className="mt-3 text-sm font-medium text-slate-500 uppercase tracking-widest">
                                    {isBreak ? 'Relax' : 'Focus'}
                                </span>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleTimer}
                                className={`group relative px-12 py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${isActive
                                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                    : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    {isActive ? 'Pause' : 'Start'}
                                </span>
                            </button>

                            <button
                                onClick={resetTimer}
                                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                                <RotateCcw className="w-5 h-5 text-slate-600" />
                            </button>

                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                disabled={isActive}
                                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                <Settings className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        {/* Pomodoro Tip */}
                        <p className="text-center text-sm text-slate-500 max-w-md leading-relaxed">
                            After 4 focus sessions, take a longer 15-30 minute break to recharge
                        </p>
                    </div>
                </div>


                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pb-16">
                    {/* Today's Progress */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <Clock className="w-6 h-6 text-indigo-500" />
                            <h3 className="text-2xl font-semibold text-slate-800">Today's Progress</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="font-medium text-slate-700">Sessions Completed</span>
                                <span className="text-2xl font-bold text-indigo-600">{sessionsCompleted}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="font-medium text-slate-700">Focus Time</span>
                                <span className="text-lg font-semibold text-slate-900">{sessionsCompleted * workMinutes} min</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="font-medium text-slate-700">Current Streak</span>
                                <span className="text-lg font-semibold text-indigo-600">3 days</span>
                            </div>

                            <div className="mt-6">
                                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                                        style={{ width: `${Math.min((sessionsCompleted / 4) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 text-right">
                                    {sessionsCompleted}/4 cycles complete
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Overview */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <TrendingUp className="w-6 h-6 text-green-500" />
                            <h3 className="text-2xl font-semibold text-slate-800">Weekly Overview</h3>
                        </div>

                        <div className="space-y-3">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <div key={day} className="flex items-center justify-between">
                                    <span className="font-medium text-slate-700 w-10">{day}</span>
                                    <div className="flex items-center space-x-2 w-full max-w-xs">
                                        <div className="bg-slate-200 h-2 rounded-full flex-grow overflow-hidden">
                                            <div
                                                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
                                                style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-slate-600 w-8 text-right">
                                            {Math.floor(Math.random() * 8)}h
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all">
                        <h3 className="text-2xl font-semibold text-slate-800 mb-6">Timer Settings</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Focus Duration
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={workMinutes}
                                        onChange={e => setWorkMinutes(Number(e.target.value))}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                    <span className="absolute right-4 top-3.5 text-slate-400 text-sm">minutes</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Break Duration
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={breakMinutes}
                                        onChange={e => setBreakMinutes(Number(e.target.value))}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                    <span className="absolute right-4 top-3.5 text-slate-400 text-sm">minutes</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="flex-1 px-6 py-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveSettings}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}