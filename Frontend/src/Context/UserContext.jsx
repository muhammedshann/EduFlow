import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { fetchWallet } from "../Redux/WalletSlice";
import { useDispatch } from "react-redux";
import { FetchCredit } from "../Redux/SubscriptionSlice";
import { Logout } from "../Redux/AuthSlice";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const dispatch = useDispatch();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("accounts/me/");
                console.log('inside of me==',res);
                dispatch(fetchWallet());
                dispatch(FetchCredit());
                
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

    const updateUser = (data) => {
        if (data === null) {
            setUser(null);
        } else {
            setUser(prev => ({ ...prev, ...data }));
        }
    };

    // Trigger the modal
    const logout = () => {
        setShowLogoutModal(true);
    };

    // Actual API Call
    const confirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await api.post("accounts/logout/");
        } catch (err) {
            console.error("Logout API failed:", err);
        } finally {
            setUser(null); 
            dispatch(Logout());
            setIsLoggingOut(false);
            setShowLogoutModal(false);
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

            {/* --- Universal Logout Confirmation Modal --- */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                        
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Ready to Leave?</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                Are you sure you want to log out of your EduFlow account?
                            </p>

                            <div className="space-y-3">
                                <button 
                                    onClick={confirmLogout}
                                    disabled={isLoggingOut}
                                    className="w-full py-3 bg-red-500 hover:bg-red-600 active:bg-red-500 text-white font-bold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    {isLoggingOut ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        "Yes, Log Out"
                                    )}
                                </button>
                                
                                <button 
                                    onClick={() => setShowLogoutModal(false)}
                                    disabled={isLoggingOut}
                                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
