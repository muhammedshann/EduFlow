import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { generateOtp } from "../../Redux/AuthSlice";
import { useNavigate } from "react-router-dom";

function EmailPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await dispatch(generateOtp(email)).unwrap();
            const createdTime = result.otp_created_at || new Date().toISOString();

            navigate(`/otp/?type=reset&email=${email}&created=${createdTime}`);

        } catch {
            setAlert("Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">

                {alert && <p className="text-red-600 mb-3">{alert}</p>}

                <h2 className="text-xl font-bold mb-4 text-center">Enter Email</h2>

                <div className="relative mb-4">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg"
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg flex justify-center items-center gap-2"
                >
                    {isLoading ? "Sending..." : "Next"}
                    <ArrowRight className="w-4 h-4" />
                </button>

            </div>
        </div>
    );
}

export default EmailPage;
