import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("accounts/me/");
                console.log('inside of me==',res);
                
                setUser(res.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const updateUser = (updatedFields) => {
        setUser(prev => ({ ...prev, ...updatedFields }));
    };

    const logout = async () => {
        try {
            await api.post("accounts/logout/");
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setUser(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-2 border-black animate-ping"></div>
                </div>
            </div>
        );
    }

    return (
        <UserContext.Provider value={{ user, setUser: updateUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
