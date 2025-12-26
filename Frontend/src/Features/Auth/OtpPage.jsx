import React, { useEffect, useState } from "react";
import { Key, ArrowRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { verifyOtp } from "../../Redux/AuthSlice";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

function OtpVerifyPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();

    const email = params.get("email");
    const otpCreationTime = params.get("created");
    const type = params.get("type");   // "register" or "reset"

    const isResetPassword = type === "reset";

    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);
    const [alert, setAlert] = useState("");

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

    const handleVerify = async () => {
        if (!otp) return;

        try {
            await dispatch(
                verifyOtp({ email, otp, register: type === "register" })
            ).unwrap();

            if (type === "register") {
                navigate("/auth");
            } else {
                navigate("/reset-password", { state: { email, otp } });
            }
        } catch {
            setAlert("Invalid OTP");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">

                {alert && <p className="text-red-600 mb-3">{alert}</p>}

                <h2 className="text-xl font-bold mb-4 text-center">Verify OTP</h2>

                <div className="relative mb-4">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg"
                    />
                </div>

                <div className="text-sm mb-4">
                    {timeLeft > 0 ? (
                        <span className="text-blue-600">Expires in {formatTime(timeLeft)}</span>
                    ) : (
                        <span className="text-red-600">OTP Expired</span>
                    )}
                </div>

                <button
                    onClick={handleVerify}
                    className="w-full bg-green-600 text-white py-2 rounded-lg flex justify-center items-center gap-2"
                >
                    <ArrowRight className="w-4 h-4" />
                    Verify OTP
                </button>

            </div>
        </div>
    );
}

export default OtpVerifyPage;
