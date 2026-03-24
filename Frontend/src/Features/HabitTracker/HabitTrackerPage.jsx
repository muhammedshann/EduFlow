import React, { useEffect, useState, useMemo } from 'react';
import { Plus, TrendingUp, CheckCircle, Flame, Heart, Info, Trash2, Activity } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AddHabit, FetchHabit, StreakStatsHabit, ToggleHabit, DeleteHabit, FetchHabitAnalytics } from '../../Redux/HabitTrackerSlice';
import { DeleteConfirmModal } from '../../Components/ConfirmDelete';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HabitTracker = () => {
    const dispatch = useDispatch();

    // MAIN STATES
    const [habits, setHabits] = useState([]);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [longestStreak, setLongestStreak] = useState(0);
    const [isAddingHabit, setIsAddingHabit] = useState(false);
    const [timeframe, setTimeframe] = useState('weekly');

    // DELETE MODAL STATES
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [habitToDelete, setHabitToDelete] = useState(null);

    // DAILY SUMMARY
    const dailySummary = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total_habits: habits.length,
        completed_habits: habits.filter(h => h.done_today || h.doneToday).length,
    };

    const totalHabits = habits.length;

    const completedHabitsToday = useMemo(
        () => habits.filter(h => h.done_today || h.doneToday).length,
        [habits]
    );

    const completionPercentage = useMemo(
        () => totalHabits > 0 ? Math.round((completedHabitsToday / totalHabits) * 100) : 0,
        [completedHabitsToday, totalHabits]
    );

    // FETCH ALL DATA
    const fetchAndSetHabits = async () => {
        try {
            const habitsRes = await dispatch(FetchHabit()).unwrap();
            const streakRes = await dispatch(StreakStatsHabit()).unwrap();

            setHabits(Array.isArray(habitsRes) ? habitsRes : []);
            setLongestStreak(streakRes?.streak ?? 0);
        } catch (err) {
            console.error("Failed to load stats:", err);
            setHabits([]);
            setLongestStreak(0);
        }
    };

    const fetchAnalytics = async (range) => {
        try {
            const data = await dispatch(FetchHabitAnalytics(range)).unwrap();
            setAnalyticsData(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load analytics:", err);
            setAnalyticsData([]);
        }
    };

    // TOGGLE HABIT
    const toggleHabitCompletion = async ({ habit_id, completed }) => {
        const previousHabits = [...habits];
        const newStatus = !completed;
        
        setHabits(prev =>
            prev.map(h => h.id === habit_id ? { ...h, done_today: newStatus } : h)
        );

        try {
            await dispatch(ToggleHabit({ habit_id, completed: newStatus })).unwrap();
            fetchAnalytics(timeframe); // Refresh analytics smoothly on toggle
        } catch (err) {
            setHabits(previousHabits);
            console.error("Sync failed:", err);
        }
    };

    const handleAddHabit = async (title, description) => {
        if (!title.trim()) return;
        await dispatch(AddHabit({ title, description })).unwrap();
        fetchAndSetHabits();
        setIsAddingHabit(false);
    };

    const handleConfirmDelete = async () => {
        if (!habitToDelete) return;
        try {
            await dispatch(DeleteHabit(habitToDelete.id)).unwrap();
            setIsDeleteModalOpen(false);
            setHabitToDelete(null);
            await fetchAndSetHabits(); 
            fetchAnalytics(timeframe);
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    useEffect(() => {
        fetchAndSetHabits();
        fetchAnalytics(timeframe);
    }, []);

    useEffect(() => {
        fetchAnalytics(timeframe);
    }, [timeframe]);

    // COMPONENT: HABIT ITEM
    const DailyHabitItem = ({ habit }) => {
        const isDone = habit.done_today ?? habit.doneToday ?? false;

        return (
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 last:border-b-0 hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 transition duration-300">
                <div className="flex items-center flex-1 min-w-0">
                    <label className="flex items-center cursor-pointer relative group">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all duration-300 ${isDone ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'}`}>
                            {isDone && <CheckCircle size={14} className="text-white" strokeWidth={3} />}
                        </div>
                        <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => toggleHabitCompletion({ habit_id: habit.id, completed: isDone })}
                            className="hidden"
                        />
                        <div className="ml-4 flex flex-col min-w-0">
                            <span className={`font-bold text-slate-800 dark:text-slate-100 truncate transition-all ${isDone ? 'line-through opacity-50' : ''}`}>
                                {habit.title}
                            </span>
                            {habit.description && (
                                <span className={`text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5 ${isDone ? 'line-through opacity-40' : ''}`}>
                                    {habit.description}
                                </span>
                            )}
                        </div>
                    </label>
                </div>

                <div className="hidden sm:flex items-center mx-4 flex-shrink-0">
                    {habit.streak > 0 && (
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-4 flex items-center bg-orange-50 dark:bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-100 dark:border-orange-500/20">
                            <Flame className="w-3.5 h-3.5 text-orange-500 mr-1.5" />
                            {habit.streak} day streak
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-4 flex-shrink-0">                    
                    <button 
                        onClick={() => {
                            setHabitToDelete(habit);
                            setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        );
    };

    // COMPONENT: ADD HABIT
    const AddHabitInput = () => {
        const [habitTitle, setHabitTitle] = useState('');
        const [habitDescription, setHabitDescription] = useState('');

        const handleSave = () => {
            if (!habitTitle.trim()) return;
            handleAddHabit(habitTitle, habitDescription);
            setHabitTitle('');
            setHabitDescription('');
        };

        return (
            <div className="flex flex-col p-5 bg-indigo-50/50 dark:bg-indigo-500/5 backdrop-blur-sm border-b border-indigo-100 dark:border-indigo-500/10 space-y-4">
                <input
                    type="text"
                    placeholder="Enter new habit name..."
                    value={habitTitle}
                    onChange={(e) => setHabitTitle(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400 shadow-sm"
                />

                <input
                    type="text"
                    placeholder="Optional description (e.g. 30 minutes before bed)"
                    value={habitDescription}
                    onChange={(e) => setHabitDescription(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400 shadow-sm"
                />

                <button
                    onClick={handleSave}
                    className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] transition-all duration-300 text-sm"
                >
                    <CheckCircle className="w-4 h-4 mr-2" /> Launch Habit
                </button>
            </div>
        );
    };

    // CUSTOM TOOLTIP FOR RECHARTS
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-[13px] mb-1">{label}</p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-extrabold text-[15px]">
                        {payload[0].value}% <span className="text-[10px] text-slate-400 font-medium ml-1">Completion</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] p-4 sm:p-8 transition-colors duration-300 pb-36 font-sans">
            <div className="max-w-6xl mx-auto space-y-8 mt-2">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
                            Habit Insights
                        </h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 tracking-wide uppercase">
                            Discipline builds extraordinary results
                        </p>
                    </div>
                </header>

                {/* PREMIUM PROGRESS CARD */}
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200/50 dark:border-slate-800/50 group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                            
                            {/* Summary Left */}
                            <div className="lg:col-span-2 flex flex-col md:flex-row items-center md:items-start gap-8">
                                <div className="relative w-36 h-36 flex-shrink-0">
                                    <svg className="w-full h-full transform -rotate-90 filter drop-shadow-xl" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                                        <circle
                                            cx="50" cy="50" r="42" fill="transparent" stroke="url(#gradient)" strokeWidth="8"
                                            strokeDasharray={2 * Math.PI * 42}
                                            strokeDashoffset={2 * Math.PI * 42 * (1 - completionPercentage / 100)}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#a855f7" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                                            {completionPercentage}%
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Today</span>
                                    </div>
                                </div>
                                
                                <div className="text-center md:text-left space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Today's Protocol</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">You have crushed {completedHabitsToday} out of {totalHabits} targets today.</p>
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Tracked Habits</p>
                                            <p className="text-lg font-black text-slate-800 dark:text-white">{dailySummary.total_habits}</p>
                                        </div>
                                        <div className="px-4 py-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20">
                                            <p className="text-[10px] text-orange-400 dark:text-orange-500 font-bold uppercase tracking-wider mb-0.5">Top Streak</p>
                                            <div className="flex items-center gap-1.5"><Flame size={16} className="text-orange-500"/><p className="text-lg font-black text-orange-600 dark:text-orange-400">{longestStreak}</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Button */}
                            <div className="flex justify-center lg:justify-end">
                                <button
                                    onClick={() => setIsAddingHabit(prev => !prev)}
                                    className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10"
                                >
                                    {isAddingHabit ? <X size={20} /> : <Plus size={20} />}
                                    {isAddingHabit ? 'Cancel' : 'New Protocol'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* SPLIT LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* HABIT CHECKLIST */}
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <Activity className="text-indigo-500" size={24}/> Active Tracking
                            </h2>
                        </div>

                        {isAddingHabit && <AddHabitInput />}

                        <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-hide bg-slate-50/50 dark:bg-transparent">
                            {habits.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><Info size={24} className="text-slate-400"/></div>
                                    <p className="font-bold text-slate-600 dark:text-slate-300 mb-1">No Active Protocols</p>
                                    <p className="text-[13px]">Define your goals and start tracking.</p>
                                </div>
                            ) : (
                                habits.map(habit => <DailyHabitItem key={habit.id} habit={habit} />)
                            )}
                        </div>
                    </div>

                    {/* PREMIUM ANALYTICS CHART */}
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-slate-200/50 dark:border-slate-800/50 p-6 flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <TrendingUp className="text-pink-500" size={24}/> Performance Yield
                            </h2>
                            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                {['weekly', 'monthly', 'yearly'].map((tab) => (
                                    <button 
                                        key={tab} 
                                        onClick={() => setTimeframe(tab)} 
                                        className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                            timeframe === tab 
                                            ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white" 
                                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 min-h-[300px] w-full relative">
                            {/* Glow Effect behind chart */}
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-purple-500/5 blur-xl pointer-events-none rounded-b-[2rem]"></div>
                            
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                                        domain={[0, 100]}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="completion_percent" 
                                        stroke="url(#colorPercent)" /* Fallback stroke overridden below */
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorPercent)" 
                                        activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2, className: 'drop-shadow-lg' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Protocol?"
                message={`Are you sure you want to permanently delete "${habitToDelete?.title}"?`}
            />
        </div>
    );
};

export default HabitTracker;