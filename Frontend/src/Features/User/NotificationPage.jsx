import { useState, useEffect } from "react";
import { Bell, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Sidebar from "../../Components/SideBar";

export default function NotificationPage() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Example mock data – Replace with API call later
        const mockNotifications = [
            {
                id: 1,
                title: "Order Delivered",
                message: "Your order #4567 has been successfully delivered!",
                type: "success",
                time: "2h ago"
            },
            {
                id: 2,
                title: "Limited Time Offer!",
                message: "Get 25% off on fresh seafood today only!",
                type: "info",
                time: "5h ago"
            },
            {
                id: 3,
                title: "Payment Failed",
                message: "Your payment for order #4589 was declined. Please try again.",
                type: "error",
                time: "1d ago"
            },
            {
                id: 4,
                title: "Referral Bonus",
                message: "You earned ₹50 for referring a new user 🎉",
                type: "success",
                time: "2d ago"
            }
        ];
        setNotifications(mockNotifications);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case "error":
                return <AlertTriangle className="w-6 h-6 text-red-500" />;
            default:
                return <Bell className="w-6 h-6 text-indigo-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
            <Sidebar className="flex-shrink-0 w-64 transition-all duration-300" />
            <div className="flex-1 w-full max-w-6xl mx-auto p-4 pb-16">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                        Notifications
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Stay updated with your latest activity and alerts
                    </p>
                </div>

                {/* Notifications List */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mt-8">
                    <div className="flex items-center space-x-3 mb-8">
                        <Bell className="w-6 h-6 text-indigo-500" />
                        <h2 className="text-2xl font-semibold text-slate-800">
                            Recent Notifications
                        </h2>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 text-lg">
                            No new notifications 🎉
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((note) => (
                                <div
                                    key={note.id}
                                    className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:scale-[1.01] 
                                        ${note.type === "success"
                                            ? "border-green-200 bg-green-50/50"
                                            : note.type === "error"
                                                ? "border-red-200 bg-red-50/50"
                                                : "border-indigo-200 bg-indigo-50/50"
                                        }`}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        {getIcon(note.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-slate-800 font-semibold">
                                                {note.title}
                                            </h3>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {note.time}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 text-sm mt-1 leading-relaxed">
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
