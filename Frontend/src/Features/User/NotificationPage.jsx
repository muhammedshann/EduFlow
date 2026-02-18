import { useState, useEffect } from "react";
import { Bell, CheckCircle, Clock, AlertTriangle, Info, Sparkles } from "lucide-react";
import api from "../../api/axios";

export default function NotificationPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cinematic Theme Constants
    const GRADIENT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20";
    const GLASS_CARD = "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl";

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('accounts/notifications/');
                setNotifications(res.data);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case "alert":
                return <AlertTriangle className="w-6 h-6 text-rose-500 dark:text-rose-400" />;
            case "feature":
                return <CheckCircle className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />;
            case "system":
                return <Info className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />;
            default:
                return <Bell className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />;
        }
    };

    return (
        // FIXED: Cinematic Gradient Background
        <div className={`min-h-screen ${GRADIENT_BG} p-6 transition-colors duration-300 pb-32`}>
            <div className="w-full max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="text-center space-y-3 pt-4">
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter flex items-center justify-center gap-3">
                        Notifications <Sparkles className="text-indigo-500 w-6 h-6" />
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                        Stay updated with your latest activity and alerts
                    </p>
                </div>

                {/* Notifications List Container - Glassmorphism Applied */}
                <div className={`${GLASS_CARD} rounded-[2.5rem] p-8 md:p-10 transition-colors duration-300`}>
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="p-3 bg-indigo-50 dark:bg-slate-800 rounded-xl">
                            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                            Recent Updates
                        </h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-slate-500 dark:text-slate-400 font-medium animate-pulse flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            Checking for updates...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 dark:text-slate-400 text-lg font-medium">
                            No new notifications 🎉
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((note) => (
                                <div
                                    key={note.id}
                                    className={`flex items-start gap-5 p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg dark:hover:shadow-slate-900/50 hover:scale-[1.01] 
                                        ${note.notification_type === "feature"
                                            ? "border-emerald-100 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5"
                                            : note.notification_type === "alert"
                                                ? "border-rose-100 bg-rose-50/50 dark:border-rose-500/20 dark:bg-rose-500/5"
                                                : "border-indigo-100 bg-indigo-50/50 dark:border-indigo-500/20 dark:bg-indigo-500/5"
                                        }`}
                                >
                                    <div className={`flex-shrink-0 mt-1 p-2 rounded-xl ${
                                        note.notification_type === "feature" ? "bg-emerald-100 dark:bg-emerald-500/10" :
                                        note.notification_type === "alert" ? "bg-rose-100 dark:bg-rose-500/10" :
                                        "bg-indigo-100 dark:bg-indigo-500/10"
                                    }`}>
                                        {getIcon(note.notification_type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <h3 className="text-slate-800 dark:text-white font-bold text-lg truncate pr-4 leading-tight">
                                                {note.title}
                                            </h3>

                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0 whitespace-nowrap bg-white/60 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/50 dark:border-slate-700 h-fit">
                                                <Clock className="w-3 h-3" />
                                                {new Date(note.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed break-words font-medium">
                                            {note.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}