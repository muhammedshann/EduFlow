import React, { useEffect, useState, useMemo } from 'react';
import { Plus, TrendingUp, CheckCircle, Flame, Heart, Info, Trash2, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AddHabit, FetchHabit, StreakStatsHabit, ToggleHabit, WeeklyStatsHabit, DeleteHabit } from '../../Redux/HabitTrackerSlice';
import { DeleteConfirmModal } from '../../Components/ConfirmDelete';
import { motion, AnimatePresence } from "framer-motion";

const HabitTracker = () => {
    const dispatch = useDispatch();

    // MAIN STATES
    const [habits, setHabits] = useState([]);
    const [weeklyOverview, setWeeklyOverview] = useState([]);
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

    // MEMO CALCULATIONS
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
            const weeklyRes = await dispatch(WeeklyStatsHabit()).unwrap();
            const streakRes = await dispatch(StreakStatsHabit()).unwrap();

            setHabits(Array.isArray(habitsRes) ? habitsRes : []);
            setWeeklyOverview(Array.isArray(weeklyRes) ? weeklyRes : []);
            setLongestStreak(streakRes?.streak ?? 0);
        } catch (err) {
            console.error("Failed to load stats:", err);
            setHabits([]);
            setWeeklyOverview([]);
            setLongestStreak(0);
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
            const weeklyRes = await dispatch(WeeklyStatsHabit()).unwrap();
            setWeeklyOverview(Array.isArray(weeklyRes) ? weeklyRes : []);
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
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    useEffect(() => {
        fetchAndSetHabits();
    }, []);

    // COMPONENT: HABIT ITEM
    const DailyHabitItem = ({ habit }) => {
        const isDone = habit.done_today ?? habit.doneToday ?? false;

        return (
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 last:border-b-0 hover:bg-purple-50/50 dark:hover:bg-indigo-500/5 transition duration-150">
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
                    className="p-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />

                <input
                    type="text"
                    placeholder="Optional description"
                    value={habitDescription}
                    onChange={(e) => setHabitDescription(e.target.value)}
                    className="p-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />

                <button
                    onClick={handleSave}
                    className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl shadow-lg shadow-purple-500/20 hover:from-purple-700 hover:to-indigo-700 transition duration-150 text-xs uppercase tracking-widest"
                >
                    <CheckCircle className="w-4 h-4 mr-2" /> Save Habit
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 p-4 sm:p-8 transition-colors duration-300 pb-32">
            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <header className="text-center py-6">
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
                        Habit Tracker<span className="text-purple-600">.</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Build consistency and master your routine</p>
                </header>

                {/* TODAY STATS */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 mb-8 border border-white/20 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Today's Progress</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Focusing on your healthy habits!</p>
                        </div>

                        <div className="flex items-center space-x-6 mt-4 sm:mt-0">
                            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                {completedHabitsToday}<span className="text-slate-400 text-xl mx-1">/</span>{totalHabits}
                            </div>

                            <div className="relative w-20 h-20">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" fill="transparent" stroke="#E2E8F0" strokeWidth="8" className="dark:stroke-slate-800" />
                                    <circle
                                        cx="50" cy="50" r="42" fill="transparent" stroke="#10B981" strokeWidth="8"
                                        strokeDasharray={2 * Math.PI * 42}
                                        strokeDashoffset={2 * Math.PI * 42 * (1 - completionPercentage / 100)}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-in-out"
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-emerald-600 dark:text-emerald-400">
                                    {completionPercentage}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HABIT LIST */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 mb-8 overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Daily Habits</h2>
                        <button
                            onClick={() => setIsAddingHabit(prev => !prev)}
                            className="flex items-center px-6 py-2.5 bg-purple-100 dark:bg-indigo-500/10 text-purple-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest rounded-full hover:bg-purple-200 dark:hover:bg-indigo-500/20 transition duration-150 shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" /> {isAddingHabit ? 'Close' : 'Add Habit'}
                        </button>
                    </div>

                    <AnimatePresence>
                        {isAddingHabit && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <AddHabitInput />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                        {habits.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                                <Info className="w-8 h-8 text-purple-400 mb-3 opacity-50" />
                                <p className="font-bold tracking-tight text-center italic">No habits found. Click 'Add Habit' to start your journey!</p>
                            </div>
                        ) : (
                            habits.map(habit => <DailyHabitItem key={habit.id} habit={habit} />)
                        )}
                    </div>
                </div>

                {/* DAILY & WEEKLY STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* DAILY SUMMARY */}
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <Heart className="w-6 h-6 text-pink-500" />
                            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                Daily Summary <span className="text-xs text-slate-400 font-bold ml-2">({dailySummary.date})</span>
                            </h3>
                        </div>

                        <div className="space-y-5">
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Total Tracked</span>
                                <span className="text-xl font-black text-slate-800 dark:text-white">{dailySummary.total_habits}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Completed Today</span>
                                <span className="text-3xl font-black text-pink-600">{dailySummary.completed_habits}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Streak</span>
                                <span className="text-xl font-black text-pink-600">{longestStreak} days</span>
                            </div>

                            <div className="mt-8 pt-4">
                                <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                                        style={{ width: `${Math.min((dailySummary.completed_habits / (dailySummary.total_habits || 1)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 text-right">
                                    {dailySummary.completed_habits}/{dailySummary.total_habits} habits completed
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* WEEKLY STATS */}
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Weekly Overview</h3>
                        </div>

                        <div className="space-y-4">
                            {Array.isArray(weeklyOverview) &&
                                weeklyOverview.map(item => (
                                    <div key={item.date} className="flex items-center justify-between">
                                        <span className="text-xs font-black text-slate-500 uppercase w-10">{item.date}</span>
                                        <div className="flex items-center space-x-3 w-full max-w-xs">
                                            <div className="bg-slate-200 dark:bg-slate-800 h-2 rounded-full flex-grow overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-1000"
                                                    style={{ width: `${Math.min(item.completion_percent, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 w-10 text-right">{item.completion_percent}%</span>
                                        </div>
                                    </div>
                                ))}
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