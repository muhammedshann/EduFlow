import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Settings, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import {
    FetchDailyStats,
    FetchPomodoro,
    FetchWeeklyStats,
    SavePomodoro,
    UpdatePomodoro,
    FetchStreak
} from "../../Redux/PomodoroSlice";

export default function Pomodoro() {
    const dispatch = useDispatch();

    const [workMinutes, setWorkMinutes] = useState(55);
    const [breakMinutes, setBreakMinutes] = useState(5);

    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [currentCycle, setCurrentCycle] = useState(1);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [daily, setDaily] = useState({});
    const [weekly, setWeekly] = useState([]);
    const [streak, setStreak] = useState(0);

    const intervalRef = useRef(null);

    const STORAGE_KEY = "pomodoro_state_v1";

    const refetchStats = async (mounted) => {
        try {
            const d = await dispatch(FetchDailyStats()).unwrap();
            if (mounted) setDaily(d);
        } catch (err) {
            console.log("FetchDailyStats error:", err);
        }

        try {
            const w = await dispatch(FetchWeeklyStats()).unwrap();
            if (mounted) setWeekly(w.week || []);
        } catch (err) {
            console.log("FetchWeeklyStats error:", err);
        }

        try {
            const s = await dispatch(FetchStreak()).unwrap();
            if (mounted) setStreak(s.streak);
        } catch (err) {
            console.log("FetchStreak error:", err);
        }
    };

    useEffect(() => {
        let mounted = true;

        const loadAll = async () => {
            try {
                const settings = await dispatch(FetchPomodoro()).unwrap();
                if (!mounted) return;

                setWorkMinutes(settings.focus_minutes);
                setBreakMinutes(settings.break_minutes);

                await refetchStats(mounted);


                const savedRaw = localStorage.getItem(STORAGE_KEY);
                if (!savedRaw) {
                    setTimeLeft(settings.focus_minutes * 60);
                    return;
                }

                const saved = JSON.parse(savedRaw);

                if (saved.isActive && saved.endTime) {
                    const now = Date.now();
                    const remainingSeconds = Math.ceil((saved.endTime - now) / 1000);

                    if (remainingSeconds > 0) {
                        setIsBreak(saved.isBreak ?? false);
                        setTimeLeft(remainingSeconds);
                        setIsActive(true);
                    } else {
                        localStorage.removeItem(STORAGE_KEY);
                        setIsBreak(false);
                        setIsActive(false);
                        setTimeLeft(settings.focus_minutes * 60);
                    }
                } else {
                    const tl = typeof saved.timeLeft === "number"
                        ? Math.max(1, saved.timeLeft)
                        : settings.focus_minutes * 60;

                    setIsBreak(saved.isBreak ?? false);
                    setTimeLeft(tl);
                    setIsActive(false);
                }

            } catch (err) {
                console.error("Error loading Pomodoro settings/stats:", err);
                setWorkMinutes(25);
                setBreakMinutes(5);
                setTimeLeft(25 * 60);
            }
        };

        loadAll();

        return () => { mounted = false; };
    }, [dispatch]);


    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (!isActive) return;

        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isActive]);

    useEffect(() => {
        if (timeLeft > 0 || !isActive) return;

        setIsActive(false);

        (async () => {
            const mounted = { current: true };

            const durationSeconds = (isBreak ? breakMinutes : workMinutes) * 60;
            const payload = {
                session_type: isBreak ? "break" : "focus",
                duration_seconds: durationSeconds,
                completed: true,
                started_at: new Date(Date.now() - (durationSeconds * 1000)).toISOString(),
                ended_at: new Date().toISOString()
            };

            try {
                await dispatch(SavePomodoro(payload)).unwrap();

                if (mounted.current) {
                    await refetchStats(mounted.current);
                }
                if (isBreak) {
                    setIsBreak(false);
                    setTimeLeft(workMinutes * 60);
                    setCurrentCycle(prev => prev + 1);
                } else {
                    setSessionsCompleted(prev => prev + 1);
                    setIsBreak(true);
                    setTimeLeft(breakMinutes * 60);
                }

            } catch (err) {
                console.log("Session completion error:", err);
                if (isBreak) {
                    setIsBreak(false);
                    setTimeLeft(workMinutes * 60);
                    setCurrentCycle(prev => prev + 1);
                } else {
                    setSessionsCompleted(prev => prev + 1);
                    setIsBreak(true);
                    setTimeLeft(breakMinutes * 60);
                }
            }

            localStorage.removeItem(STORAGE_KEY);

            return () => { mounted.current = false; };

        })();

    }, [timeLeft, isBreak, workMinutes, breakMinutes, dispatch, isActive]);


    const toggleTimer = () => {
        // starting
        if (!isActive) {
            const endTime = Date.now() + timeLeft * 1000;
            const payload = {
                isBreak,
                isActive: true,
                endTime
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            setIsActive(true);
            return;
        }

        const pausedPayload = {
            isBreak,
            isActive: false,
            timeLeft
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pausedPayload));
        setIsActive(false);
    };


    const resetTimer = () => {
        setIsActive(false);
        setIsBreak(false);
        setTimeLeft(workMinutes * 60);
        localStorage.removeItem(STORAGE_KEY);
    };


    const saveSettings = async () => {
        if (!isActive) {
            try {
                const updated = await dispatch(UpdatePomodoro({
                    focus_minutes: workMinutes,
                    break_minutes: breakMinutes,
                })).unwrap();

                setWorkMinutes(updated.focus_minutes);
                setBreakMinutes(updated.break_minutes);
                setTimeLeft(updated.focus_minutes * 60);

                const savedRaw = localStorage.getItem(STORAGE_KEY);
                if (savedRaw) {
                    const saved = JSON.parse(savedRaw);
                    if (!saved.isActive) {
                        saved.timeLeft = (saved.isBreak ? updated.break_minutes : updated.focus_minutes) * 60;
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
                    }
                }
            } catch (err) {
                console.log("Update error:", err);
            }
        }
        setIsSettingsOpen(false);
    };


    const formatTime = seconds => {
        const minutes = Math.floor(Math.max(0, seconds) / 60);
        const remainingSeconds = Math.max(0, seconds) % 60;
        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    };

    const getProgress = () => {
        const totalTime = isBreak ? breakMinutes * 60 : workMinutes * 60;
        if (totalTime <= 0 || timeLeft >= totalTime) return 0;
        return ((totalTime - timeLeft) / totalTime) * 100;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex transition-colors duration-300">
            <div className="flex-1 w-full max-w-6xl mx-auto p-4 pb-16">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                        Pomodoro Timer
                    </h1>
                    <p className="text-gray-600 dark:text-slate-400 text-lg">
                        Boost your productivity with focused work sessions
                    </p>
                </div>

                {/* Main Timer Section */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 p-12 mt-8">
                    <div className="flex flex-col items-center space-y-8">

                        {/* Status Badge */}
                        <div className={`px-6 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${isBreak ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'}`}>
                            {isBreak ? '☕ Break Time' : '🎯 Focus Session'} · Cycle {currentCycle}
                        </div>

                        {/* Circular Timer */}
                        <div className="relative">
                            <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 200 200">
                                <circle cx="100" cy="100" r="90" stroke="#E2E8F0" className="dark:stroke-slate-800" strokeWidth="8" fill="transparent" />
                                <circle
                                    cx="100" cy="100" r="90"
                                    stroke={isBreak ? "#10B981" : "#6366F1"}
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 90}
                                    strokeDashoffset={2 * Math.PI * 90 * (1 - getProgress() / 100)}
                                    strokeLinecap="round"
                                    className={`${isActive ? "transition-[stroke-dashoffset] duration-1000 ease-linear" : "transition-none"}`}
                                />
                                <circle
                                    cx="100" cy="100" r="90"
                                    stroke={isBreak ? "#10B981" : "#6366F1"}
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 90}
                                    strokeDashoffset={2 * Math.PI * 90 * (1 - getProgress() / 100)}
                                    strokeLinecap="round"
                                    className={`opacity-20 blur-lg ${isActive ? "transition-[stroke-dashoffset] duration-1000 ease-linear" : "transition-none"}`}
                                />
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-7xl font-extralight tracking-tight text-slate-800 dark:text-slate-100">{formatTime(timeLeft)}</span>
                                <span className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">{isBreak ? 'Relax' : 'Focus'}</span>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center gap-4">
                            <button onClick={toggleTimer} className={`group relative px-12 py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${isActive ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-indigo-500 to-indigo-600"}`}>
                                <span className="flex items-center gap-3">{isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}{isActive ? 'Pause' : 'Start'}</span>
                            </button>

                            <button onClick={resetTimer} className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 transform hover:scale-105 active:scale-95">
                                <RotateCcw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>

                            <button onClick={() => setIsSettingsOpen(true)} disabled={isActive} className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                                <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>

                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">After 4 focus sessions, take a longer 15-30 minute break to recharge</p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pb-16">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <Clock className="w-6 h-6 text-indigo-500" />
                            <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Today's Progress <span className="text-sm text-slate-500 ml-2">({daily.date || "—"})</span></h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between"><span className="font-medium text-slate-700 dark:text-slate-300">Sessions Completed</span><span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{daily.sessions_completed || 0}</span></div>
                            <div className="flex justify-between"><span className="font-medium text-slate-700 dark:text-slate-300">Focus Time</span><span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{daily.focus_minutes || 0} min</span></div>
                            <div className="flex justify-between"><span className="font-medium text-slate-700 dark:text-slate-300">Current Streak</span><span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{streak}</span></div>

                            <div className="mt-6">
                                <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                    <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700" style={{ width: `${Math.min((daily.sessions_completed / 4) * 100, 100)}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">{daily.sessions_completed}/4 cycles complete</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 p-8">
                        <div className="flex items-center space-x-3 mb-6"><TrendingUp className="w-6 h-6 text-green-500" /><h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Weekly Overview</h3></div>

                        <div className="space-y-3">
                            {Array.isArray(weekly) && weekly.map(item => (
                                <div key={item.date} className="flex items-center justify-between">
                                    <span className="font-medium text-slate-700 dark:text-slate-300 w-10">{item.date}</span>
                                    <div className="flex items-center space-x-2 w-full max-w-xs">
                                        <div className="bg-slate-200 dark:bg-slate-800 h-2 rounded-full flex-grow overflow-hidden">
                                            <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700" style={{ width: `${Math.min(item.focus_minutes * 5, 100)}%` }}></div>
                                        </div>
                                        <span className="text-xs text-slate-600 dark:text-slate-400 w-8 text-right">{Math.floor(item.focus_minutes)}m</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all border dark:border-slate-800">
                        <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Timer Settings</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Focus Duration</label>
                                <div className="relative">
                                    <input type="number" min="1" max="60" value={workMinutes} onChange={e => setWorkMinutes(Number(e.target.value))} className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 bg-transparent dark:text-white rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                                    <span className="absolute right-4 top-3.5 text-slate-400 text-sm">minutes</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Break Duration</label>
                                <div className="relative">
                                    <input type="number" min="1" max="30" value={breakMinutes} onChange={e => setBreakMinutes(Number(e.target.value))} className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 bg-transparent dark:text-white rounded-xl focus:border-indigo-500 focus:outline-none transition-colors" />
                                    <span className="absolute right-4 top-3.5 text-slate-400 text-sm">minutes</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setIsSettingsOpen(false)} className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button onClick={saveSettings} className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}