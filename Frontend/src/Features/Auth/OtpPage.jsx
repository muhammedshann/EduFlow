import React, { useEffect, useState } from "react";
import { Key, ArrowRight, Sparkles, Timer, ShieldCheck, Loader2, RotateCcw } from "lucide-react";
import { useDispatch } from "react-redux";
import { generateOtp, verifyOtp } from "../../Redux/AuthSlice";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

function OtpVerifyPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    // const [params] = useSearchParams();

    const email = location.state?.email;
    const otpCreationTime = location.state?.created;
    const type = location.state?.type;

    // const email = params.get("email");
    // const otpCreationTime = params.get("created");
    // const type = params.get("type");

    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ message: "", type: "", show: false });

    useEffect(() => {
        if (!otpCreationTime) return;
        const OTP_DURATION = 300;

        const calculate = () => {
            const created = new Date(otpCreationTime).getTime();
            const now = Date.now();
            const diff = Math.floor((now - created) / 1000);
            const remaining = OTP_DURATION - diff;
            setTimeLeft(remaining > 0 ? remaining : 0);
        };

        calculate();
        const timer = setInterval(calculate, 1000);
        return () => clearInterval(timer);
    }, [otpCreationTime]);

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? "0" : ""}${sec}`;
    };

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        if (!otp || otp.length < 4) return;

        setIsLoading(true);
        try {
            await dispatch(
                verifyOtp({ email, otp, register: type === "register" })
            ).unwrap();

            if (type === "register") {
                navigate("/auth");
            } else {
                navigate("/reset-password", { state: { email, otp } });
            }
        } catch (err) {
            setAlert({ message: "Invalid or expired OTP", type: "error", show: true });
            setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && otp.length >= 4 && timeLeft > 0) handleVerify();
    };

    const handleResend = async () => {
        try {
            const result = await dispatch(generateOtp(email)).unwrap();
            const createdTime = result.created_at;
            const params = new URLSearchParams({
                type: type || 'reset',
                email: email,
                created: createdTime
            }).toString();

            navigate(`/otp/?${params}`, { replace: true });
            setAlert({ message: "New code sent!", type: "success", show: true });
            setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 3000);
        } catch (err) {
            setAlert({ message: "Failed to resend code", type: "error", show: true });
        }
    };

    return (
        <div className="h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4 transition-colors duration-500 overflow-hidden">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                
                {/* Floating Alert */}
                {alert.show && (
                    <div className={`fixed bottom-6 right-6 max-w-xs p-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-right ${alert.type === "success" ? "bg-emerald-500" : "bg-rose-500"} text-white`}>
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={18} />
                            <p className="text-xs font-bold">{alert.message}</p>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="text-center mb-6">
                    <div className="relative inline-block mb-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300">
                            <span className="text-white font-black text-2xl tracking-tighter">EF</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                        EduFlow
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1 flex items-center justify-center gap-2 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        Verify Identity
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl dark:shadow-indigo-500/10 border border-white dark:border-slate-800 overflow-hidden transition-all duration-500">
                    <div className="p-8 space-y-6">
                        <div className="text-center space-y-1">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Check your email</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Code sent to <span className="font-bold text-indigo-600 dark:text-indigo-400">{email}</span>
                            </p>
                        </div>

                        {/* OTP Input Field */}
                        <div className="space-y-4">
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="••••••"
                                    maxLength={6}
                                    value={otp}
                                    onKeyDown={handleKeyDown}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl outline-none transition-all text-xl tracking-[0.5em] font-mono text-center text-slate-800 dark:text-white placeholder:tracking-normal placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                />
                            </div>

                            {/* Timer UI */}
                            <div className="flex items-center justify-center gap-2">
                                <Timer size={14} className={`${timeLeft > 0 ? "text-indigo-500 animate-pulse" : "text-rose-500"}`} />
                                <span className={`text-[11px] font-black uppercase tracking-wider ${timeLeft > 0 ? "text-slate-500 dark:text-slate-400" : "text-rose-600"}`}>
                                    {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : "Code Expired"}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleVerify}
                                disabled={isLoading || timeLeft === 0 || otp.length < 4}
                                className="group w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Verify Code</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            
                            <button 
                                onClick={handleResend}
                                className="w-full py-2 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-tighter"
                            >
                                <RotateCcw size={14} />
                                Resend Code
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Brand */}
                <p className="text-center mt-6 text-slate-400 dark:text-slate-600 text-[10px] tracking-[0.2em] uppercase font-bold">
                    Secured by EduFlow Auth
                </p>
            </div>
        </div>
    );
}

export default OtpVerifyPage;