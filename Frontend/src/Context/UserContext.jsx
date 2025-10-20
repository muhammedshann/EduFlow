// src/context/UserContext.js
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useSelector } from "react-redux";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // ⏱️ Load cached user for instant UI
        const cachedUser = localStorage.getItem("user");
        return cachedUser ? JSON.parse(cachedUser) : null;
    });

    const [loading, setLoading] = useState(true);
    const User = useSelector((state) => state.auth.user)
    // Fetch logged-in user info safely from backend
    useEffect(() => {
        const fetchUser = async () => {
            try {
                localStorage.clear();
                const res = await api.get("accounts/me/", { withCredentials: true });
                setUser(res.data);
                // ✅ Cache non-sensitive data only
                localStorage.setItem("user", JSON.stringify(res.data));
            } catch (err) {
                if (err.response?.status === 401) {
                    // Not logged in
                    setUser(null);
                    localStorage.removeItem("user");
                } else {
                    setUser(null);
                    localStorage.removeItem("user");
                    console.error("Unexpected error fetching user:", err);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Logout function
    const logout = async () => {
        try {
            await api.post("accounts/logout/", {}, { withCredentials: true });
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            // ✅ Always clean local + state
            setUser(null);
            localStorage.removeItem("user");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
            <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-black animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-2 border-black animate-ping animation-delay-1000"></div>
            </div>
            </div>
        );
    }

    return (
        <UserContext.Provider value={{ user, setUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
