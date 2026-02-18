import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Settings, Clock, TrendingUp, Sparkles, X } from "lucide-react";
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

    // Cinematic Theme Constants
    const GRADIENT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20";
    const GLASS_CARD = "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-xl";
    const INPUT_BG = "bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700";

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
        // FIXED: Cinematic Gradient Background
        <div className={`min-h-screen ${GRADIENT_BG} flex transition-colors duration-300 pb-32`}>
            <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 pb-24 md:pb-16">
                
                {/* Header */}
                <div className="text-center space-y-3 mt-4">
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter flex items-center justify-center gap-3">
                        Pomodoro Timer <Sparkles className="text-indigo-500 w-6 h-6" />
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-lg px-4">
                        Boost your productivity with focused work sessions
                    </p>
                </div>

                {/* Main Timer Section - Glassmorphism Applied */}
                <div className={`${GLASS_CARD} rounded-[2.5rem] p-6 md:p-12 mt-8`}>
                    <div className="flex flex-col items-center space-y-8">

                        {/* Status Badge */}
                        <div className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${isBreak ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'}`}>
                            {isBreak ? '☕ Break Time' : '🎯 Focus Session'} · Cycle {currentCycle}
                        </div>

                        {/* Circular Timer */}
                        <div className="relative">
                            <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90" viewBox="0 0 200 200">
                                <circle cx="100" cy="100" r="90" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="8" fill="transparent" />
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
                                    className={`opacity-20 blur-xl ${isActive ? "transition-[stroke-dashoffset] duration-1000 ease-linear" : "transition-none"}`}
                                />
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl md:text-8xl font-black tracking-tighter text-slate-800 dark:text-white leading-none">{formatTime(timeLeft)}</span>
                                <span className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{isBreak ? 'Relax' : 'Focus'}</span>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                            <button onClick={toggleTimer} className={`flex-grow md:flex-grow-0 group relative px-10 py-4 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${isActive ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"}`}>
                                <span className="flex items-center justify-center gap-3 uppercase text-sm tracking-wider">{isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}{isActive ? 'Pause' : 'Start'}</span>
                            </button>

                            <button onClick={resetTimer} className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 transform hover:scale-105 active:scale-95">
                                <RotateCcw className="w-5 h-5" />
                            </button>

                            <button onClick={() => setIsSettingsOpen(true)} disabled={isActive} className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-center text-xs font-medium text-slate-400 max-w-md leading-relaxed px-4">Tip: After 4 focus sessions, take a longer 15-30 minute break to recharge.</p>
                    </div>
                </div>

                {/* Stats Section - Glassmorphism Applied */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <div className={`${GLASS_CARD} rounded-[2rem] p-8`}>
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Today's Progress <span className="text-xs font-medium text-slate-400 ml-2">({daily.date || "—"})</span></h3>
                        </div>

                        <div className="space-y-5">
                            <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-500 dark:text-slate-400">Sessions Completed</span><span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{daily.sessions_completed || 0}</span></div>
                            <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-500 dark:text-slate-400">Focus Time</span><span className="text-lg font-bold text-slate-800 dark:text-white">{daily.focus_minutes || 0} min</span></div>
                            <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-500 dark:text-slate-400">Current Streak</span><span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{streak}</span></div>

                            <div className="mt-6">
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700" style={{ width: `${Math.min((daily.sessions_completed / 4) * 100, 100)}%` }}></div>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3 text-right">{daily.sessions_completed}/4 cycles complete</p>
                            </div>
                        </div>
                    </div>

                    <div className={`${GLASS_CARD} rounded-[2rem] p-8`}>
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Weekly Overview</h3>
                        </div>

                        <div className="space-y-4">
                            {Array.isArray(weekly) && weekly.map(item => (
                                <div key={item.date} className="flex items-center justify-between group">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-10 uppercase tracking-wider">{item.date}</span>
                                    <div className="flex items-center space-x-3 w-full max-w-xs">
                                        <div className="bg-slate-100 dark:bg-slate-800 h-2 rounded-full flex-grow overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700" style={{ width: `${Math.min(item.focus_minutes * 5, 100)}%` }}></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 w-8 text-right group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">{Math.floor(item.focus_minutes)}m</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Settings Modal - Glassmorphism Applied */}
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in zoom-in duration-300">
                    <div className={`${GLASS_CARD} rounded-[2.5rem] max-w-md w-full p-8`}>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Timer Settings</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 block">Focus Duration</label>
                                <div className="relative">
                                    <input type="number" min="1" max="60" value={workMinutes} onChange={e => setWorkMinutes(Number(e.target.value))} className={`w-full px-5 py-4 ${INPUT_BG} rounded-xl text-lg font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all`} />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold uppercase tracking-wider">minutes</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 block">Break Duration</label>
                                <div className="relative">
                                    <input type="number" min="1" max="30" value={breakMinutes} onChange={e => setBreakMinutes(Number(e.target.value))} className={`w-full px-5 py-4 ${INPUT_BG} rounded-xl text-lg font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all`} />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold uppercase tracking-wider">minutes</span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setIsSettingsOpen(false)} className="flex-1 px-6 py-3.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-wider">Cancel</button>
                                <button onClick={saveSettings} className="flex-1 px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}