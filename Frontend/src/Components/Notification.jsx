import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const Notification = () => {
    const [alert, setAlert] = useState({
        message: '',
        type: '', // 'success' or 'error'
        show: false,
        autoHide: true,
        progress: 100
    });

    // Get message and type from Redux
    const reduxMessage = useSelector((state) => state.auth?.message);
    const reduxMessageType = useSelector((state) => state.auth?.messageType || "error");

    // Function to show alert
    const showAlert = (message, type = 'success', autoHide = true) => {
        let formattedMessage = message;

        if (typeof message === "object" && message !== null) {
            if (message.errors) {
                // Flatten validation errors
                formattedMessage = Object.entries(message.errors)
                    .map(([field, msgs]) => {
                        if (Array.isArray(msgs)) return msgs.join(", ");
                        return String(msgs);
                    })
                    .join(" | ");
            } else {
                formattedMessage = JSON.stringify(message);
            }
        }

        setAlert({
            message: formattedMessage,
            type,
            show: true,
            autoHide,
            progress: 100
        });

        if (autoHide) {
            setTimeout(() => {
                setAlert(prev => ({ ...prev, show: false }));
            }, 4000);

            const interval = setInterval(() => {
                setAlert(prev => {
                    if (prev.progress <= 0) {
                        clearInterval(interval);
                        return prev;
                    }
                    return { ...prev, progress: prev.progress - 25 };
                });
            }, 1000);
        }
    };


    // Show Redux messages automatically
    useEffect(() => {
        if (reduxMessage) {
            showAlert(reduxMessage, reduxMessageType);
        }
    }, [reduxMessage, reduxMessageType]);

    return (
        <>
            {alert.show && (
                <div
                    className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${alert.type === "success"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                        } ${alert.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {alert.type === "success" ? (
                                <div className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium">
                                    {alert.type === "success" ? "Success" : "Error"}
                                </p>
                                <p className="text-sm opacity-90">{alert.message}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAlert({ ...alert, show: false })}
                            className="flex-shrink-0 w-5 h-5 text-white/70 hover:text-white transition-colors duration-150 ml-3"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default Notification;
