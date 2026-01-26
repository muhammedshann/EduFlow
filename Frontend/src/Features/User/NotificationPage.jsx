import { useState, useEffect } from "react";
import { Bell, CheckCircle, Clock, AlertTriangle, Info } from "lucide-react";
import api from "../../api/axios";

export default function NotificationPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Matches the choices in your Django Model: 'system', 'feature', 'alert'
    const getIcon = (type) => {
        switch (type) {
            case "alert":
                return <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />;
            case "feature":
                return <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400" />;
            case "system":
                return <Info className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />;
            default:
                return <Bell className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />;
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto pb-16 transition-colors duration-300">
            {/* Header */}
            <div className="text-center space-y-2 mt-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                    Notifications
                </h1>
                <p className="text-gray-600 dark:text-slate-400 text-lg">
                    Stay updated with your latest activity and alerts
                </p>
            </div>

            {/* Notifications List */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700 p-8 mt-8 transition-colors duration-300">
                <div className="flex items-center space-x-3 mb-8">
                    <Bell className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">
                        Recent Notifications
                    </h2>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-lg animate-pulse">
                        Checking for updates...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-lg">
                        No new notifications 🎉
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((note) => (
                            <div
                                key={note.id}
                                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:scale-[1.01] 
                                    ${note.notification_type === "feature"
                                        ? "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10"
                                        : note.notification_type === "alert"
                                            ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10"
                                            : "border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-900/10"
                                    }`}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {getIcon(note.notification_type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <h3 className="text-slate-800 dark:text-slate-100 font-bold truncate pr-4" title={note.title}>
                                            {note.title}
                                        </h3>

                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 whitespace-nowrap bg-white/50 dark:bg-slate-900/50 px-2 py-1 rounded-full border border-slate-100 dark:border-slate-700 h-fit">
                                            <Clock className="w-3 h-3" />
                                            {new Date(note.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 leading-relaxed break-words line-clamp-3">
                                        {note.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}