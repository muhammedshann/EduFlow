import React, { useEffect, useState } from "react";
import { Key, ArrowRight, Sparkles, Timer, ShieldCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import { generateOtp, verifyOtp } from "../../Redux/AuthSlice";
import { useNavigate, useSearchParams } from "react-router-dom";

function OtpVerifyPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const email = params.get("email");
    const otpCreationTime = params.get("created");
    const type = params.get("type"); // "register" or "reset"

    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ message: "", type: "", show: false });

    useEffect(() => {
        if (!otpCreationTime) return;
        const OTP_DURATION = 300; // 5 minutes

        const calculate = () => {
            // 1. Parse the server time
            const created = new Date(otpCreationTime).getTime();
            // 2. Get current time
            const now = Date.now();
            
            // 3. Calculate the difference in seconds
            const diff = Math.floor((now - created) / 1000);
            const remaining = OTP_DURATION - diff;

            // Debugging: If you see a huge negative number here, your 
            // server time and local time are out of sync.
            // console.log("Diff:", diff, "Remaining:", remaining);
            console.log("Server Time:", new Date(otpCreationTime).toLocaleString());
            console.log("Local Time:", new Date().toLocaleString());
            console.log("Seconds passed:", diff);

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
        e.preventDefault();
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

    const handleResend = async () => {
        try {
            const result = await dispatch(generateOtp(email)).unwrap();

            const createdTime = result.created_at;
            const params = new URLSearchParams({
                type: 'reset',
                email: email,
                created: createdTime
            }).toString();

            navigate(`/otp/?${params}`, { replace: true });

            setAlert({ message: "New code sent!", type: "success", show: true });
        } catch (err) {
            setAlert({ message: "Failed to resend code", type: "error", show: true });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4 overflow-auto">
            <div className="w-full max-w-md">
                
                {/* Floating Alert */}
                {alert.show && (
                    <div className={`fixed bottom-4 right-4 max-w-md p-4 rounded-xl shadow-2xl z-50 transition-all duration-500 transform ${alert.show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"} ${alert.type === "success" ? "bg-green-500" : "bg-red-500"} text-white`}>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5" />
                            <p className="text-sm font-medium">{alert.message}</p>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-2xl opacity-40 animate-pulse"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-300">
                            <span className="text-white font-black text-3xl tracking-tighter">EF</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent mb-2">
                        EduFlow
                    </h1>
                    <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Verification Required
                    </p>
                </div>

                {/* Glassmorphism Card */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden hover:shadow-purple-100/50 transition-all duration-500">
                    <div className="p-8 space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-800">Check your email</h2>
                            <p className="text-gray-500 text-sm">We've sent a code to <span className="font-semibold text-purple-600">{email}</span></p>
                        </div>

                        {/* OTP Input Field */}
                        <div className="space-y-4">
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-300 text-lg tracking-[0.5em] font-mono text-center placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                                />
                            </div>

                            {/* Timer UI */}
                            <div className="flex items-center justify-center gap-2 py-2">
                                <Timer className={`w-4 h-4 ${timeLeft > 0 ? "text-blue-500 animate-pulse" : "text-red-500"}`} />
                                <span className={`text-sm font-bold ${timeLeft > 0 ? "text-blue-600" : "text-red-600"}`}>
                                    {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : "Code Expired"}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <button
                                onClick={handleVerify}
                                disabled={isLoading || timeLeft === 0 || otp.length < 4}
                                className="group w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-purple-200 hover:shadow-purple-400/30 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Verify Code</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            
                            <button 
                                onClick={handleResend}
                                className="w-full py-2 text-gray-400 text-sm font-medium hover:text-purple-600 transition-colors"
                            >
                                Didn't receive code? Resend
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Brand */}
                <p className="text-center mt-8 text-gray-400 text-xs tracking-widest uppercase">
                    Secured by EduFlow Auth
                </p>
            </div>
        </div>
    );
}

export default OtpVerifyPage;
