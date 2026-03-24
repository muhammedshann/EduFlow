import React, { useEffect, useState, useMemo } from 'react';
import { Plus, TrendingUp, CheckCircle, Flame, Heart, Info, Trash2, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AddHabit, FetchHabit, StreakStatsHabit, ToggleHabit, DeleteHabit, FetchHabitAnalytics } from '../../Redux/HabitTrackerSlice';
import { DeleteConfirmModal } from '../../Components/ConfirmDelete';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HabitTracker = () => {
    const dispatch = useDispatch();

    // MAIN STATES
    const [habits, setHabits] = useState([]);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [timeframe, setTimeframe] = useState('weekly');
    const [longestStreak, setLongestStreak] = useState(0);
    const [isAddingHabit, setIsAddingHabit] = useState(false);

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
            fetchAnalytics(timeframe); // Refresh analytics seamlessly
        } catch (err) {
            setHabits(previousHabits);
            console.error("Sync failed:", err);
        }
    };

    // ADD HABIT
    const handleAddHabit = async (title, description) => {
        if (!title.trim()) return;
        await dispatch(AddHabit({ title, description })).unwrap();
        fetchAndSetHabits();
        setIsAddingHabit(false);
    };

    // DELETE LOGIC
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
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 last:border-b-0 hover:bg-purple-50/50 dark:hover:bg-slate-800/50 transition duration-150">
                <div className="flex items-center flex-1 min-w-0">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={habit.done_today}
                            onChange={() => toggleHabitCompletion({
                                habit_id: habit.id,
                                completed: habit.done_today
                            })}
                            className={`form-checkbox h-5 w-5 rounded-md cursor-pointer transition duration-150 ease-in-out ${habit.done_today
                                    ? 'text-purple-600 border-purple-600 bg-purple-100 dark:bg-slate-700'
                                    : 'text-purple-600 border-gray-300 dark:border-slate-600 dark:bg-slate-800'
                                }`}
                        />

                        <div className="ml-3 flex flex-col min-w-0">
                            <span className={`font-semibold text-gray-800 dark:text-slate-100 truncate ${isDone ? 'line-through text-gray-400 dark:text-slate-500' : ''}`}>
                                {habit.title}
                            </span>

                            {habit.description && (
                                <span className={`text-sm text-gray-500 dark:text-slate-400 truncate ${isDone ? 'line-through italic text-gray-400 dark:text-slate-500' : ''}`}>
                                    {habit.description}
                                </span>
                            )}
                        </div>
                    </label>
                </div>

                <div className="hidden sm:flex items-center mx-4 flex-shrink-0">
                    {habit.streak > 0 && (
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400 mr-4 flex items-center">
                            <Flame className="w-4 h-4 text-orange-400 mr-1" />
                            {habit.streak} day streak
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-4 flex-shrink-0">
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {habit.weekCount}/{habit.totalDays} this week
                    </span>
                    
                    <button 
                        onClick={() => {
                            setHabitToDelete(habit);
                            setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
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
            <div className="flex flex-col p-4 pt-0 border-b border-gray-100 dark:border-slate-800 space-y-3">
                <input
                    type="text"
                    placeholder="Enter new habit name"
                    value={habitTitle}
                    onChange={(e) => setHabitTitle(e.target.value)}
                    className="p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none"
                />

                <input
                    type="text"
                    placeholder="Optional description"
                    value={habitDescription}
                    onChange={(e) => setHabitDescription(e.target.value)}
                    className="p-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none"
                />

                <button
                    onClick={handleSave}
                    className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-150 text-sm"
                >
                    <CheckCircle className="w-4 h-4 mr-1" /> Save Habit
                </button>
            </div>
        );
    };

    // CUSTOM TOOLTIP FOR RECHARTS
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800 dark:text-slate-100 text-sm mb-1">{label}</p>
                    <p className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                        {payload[0].value}% <span className="text-xs text-gray-500 font-normal">Completion</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        /* FIXED: Added large pb-36 padding to ensure all summary sections clear the floating dock */
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 p-4 sm:p-8 transition-colors duration-300 pb-36">
            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <header className="text-center py-6">
                    <h1 className="text-3xl font-extrabold text-purple-800 dark:text-white">Habit Tracker</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Build consistent daily habits and track your progress</p>
                </header>

                {/* TODAY STATS */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Today's Progress</h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Focusing on building these healthy habits!</p>
                        </div>

                        <div className="flex items-center space-x-4 mt-3 sm:mt-0">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {completedHabitsToday}/{totalHabits}
                            </div>

                            <div className="relative w-16 h-16">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="#E5E7EB" strokeWidth="10" className="dark:stroke-slate-800" />
                                    <circle
                                        cx="50" cy="50" r="45" fill="transparent" stroke="#10B981" strokeWidth="10"
                                        strokeDasharray={2 * Math.PI * 45}
                                        strokeDashoffset={2 * Math.PI * 45 * (1 - completionPercentage / 100)}
                                        strokeLinecap="round"
                                        className="transition-all duration-700 ease-in-out"
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400">
                                    {completionPercentage}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HABIT LIST */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 mb-8">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Daily Habits</h2>
                        <button
                            onClick={() => setIsAddingHabit(prev => !prev)}
                            className="flex items-center px-4 py-2 bg-purple-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-semibold rounded-full hover:bg-purple-200 dark:hover:bg-slate-700 transition duration-150 text-sm shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-1" /> {isAddingHabit ? 'Close' : 'Add Habit'}
                        </button>
                    </div>

                    {isAddingHabit && <AddHabitInput />}

                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                        {habits.length === 0 ? (
                            <div className="flex items-center justify-center p-8 text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-900/50">
                                <Info className="w-5 h-5 text-purple-400 mr-2" />
                                <p className="font-medium">No habits found. Click 'Add Habit' to start tracking!</p>
                            </div>
                        ) : (
                            habits.map(habit => <DailyHabitItem key={habit.id} habit={habit} />)
                        )}
                    </div>
                </div>

                {/* DAILY & ANALYTICS STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* DAILY SUMMARY */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 p-6 sm:p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <Heart className="w-6 h-6 text-pink-500" />
                            <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">
                                Daily Summary <span className="text-sm text-gray-500 dark:text-slate-400 ml-2">({dailySummary.date})</span>
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                                <span className="font-medium text-gray-700 dark:text-slate-300">Total Habits Tracked</span>
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">{dailySummary.total_habits}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                                <span className="font-medium text-gray-700 dark:text-slate-300">Habits Completed Today</span>
                                <span className="text-2xl font-bold text-pink-600">{dailySummary.completed_habits}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700 dark:text-slate-300">Streak</span>
                                <span className="text-lg font-semibold text-pink-600">{longestStreak} days</span>
                            </div>

                            <div className="mt-6 pt-2">
                                <div className="w-full bg-gray-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
                                        style={{ width: `${Math.min((dailySummary.completed_habits / dailySummary.total_habits) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 text-right">
                                    {dailySummary.completed_habits}/{dailySummary.total_habits} habits completed
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC ANALYTICS */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 p-6 sm:p-8 flex flex-col">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-3">
                            <div className="flex items-center space-x-3">
                                <TrendingUp className="w-6 h-6 text-purple-500" />
                                <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">Performance Analytics</h3>
                            </div>
                            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                                {['weekly', 'monthly', 'yearly'].map(tab => (
                                    <button 
                                        key={tab} 
                                        onClick={() => setTimeframe(tab)} 
                                        className={`px-3 py-1.5 text-xs font-semibold capitalize rounded-md transition-all ${
                                            timeframe === tab 
                                            ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400" 
                                            : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 w-full min-h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analyticsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                                        domain={[0, 100]}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#a855f7', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="completion_percent" 
                                        stroke="#a855f7"
                                        strokeWidth={3} 
                                        fill="url(#colorPercent)" 
                                        activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
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
                title="Delete Habit?"
                message={`Are you sure you want to delete "${habitToDelete?.title}"? All progress for this habit will be lost.`}
            />
        </div>
    );
};

export default HabitTracker;