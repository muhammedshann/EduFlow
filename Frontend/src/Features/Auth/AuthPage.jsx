import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import { Login, SignUp } from "../../Redux/AuthSlice";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext";
import { GoogleLogin } from "@react-oauth/google";
import api from "../../api/axios";
import { showNotification } from "../../Redux/NotificationSlice";

function LoginPage() {

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { setUser } = useUser();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        register: true
    });

    const [errors, setErrors] = useState({});

    /* ---------------- VALIDATION ---------------- */

    const validators = {

        first_name: (v) => {
            if (!v.trim()) return "First name required";
            if (!/^[A-Za-z]{2,30}$/.test(v)) return "Only letters (2-30 chars)";
            return "";
        },

        last_name: (v) => {
            if (!v.trim()) return "Last name required";
            if (!/^[A-Za-z]{2,30}$/.test(v)) return "Only letters (2-30 chars)";
            return "";
        },

        username: (v) => {
            if (!v.trim()) return "Username required";
            if (!/^[A-Za-z][A-Za-z0-9_]{3,19}$/.test(v))
                return "4-20 chars, start with letter, only letters/numbers/_";
            return "";
        },

        email: (v) => {
            if (!v.trim()) return "Email required";
            if (!/^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(v))
                return "Invalid email";
            return "";
        },

        password: (v) => {
            if (!v.trim()) return "Password required";

            if (!/^(?=.*[a-z])/.test(v)) return "Must include lowercase";
            if (!/^(?=.*[A-Z])/.test(v)) return "Must include uppercase";
            if (!/^(?=.*\d)/.test(v)) return "Must include number";
            if (!/^(?=.*[@$!%*?&])/.test(v)) return "Must include special char";
            if (v.length < 8) return "Minimum 8 characters";

            return "";
        }

    };

    const validateField = (name, value) => {
        if (!validators[name]) return "";

        const error = validators[name](value);

        setErrors((prev) => ({
            ...prev,
            [name]: error
        }));

        return error;
    };

    const validateForm = () => {

        let newErrors = {};

        Object.keys(validators).forEach((field) => {

            if (isLogin && (field === "first_name" || field === "last_name" || field === "email"))
                return;

            const error = validators[field](formData[field] || "");

            if (error) newErrors[field] = error;

        });

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    /* ---------------- INPUT ---------------- */

    const handleInputChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        validateField(name, value);
    };

    /* ---------------- GOOGLE LOGIN ---------------- */

    const handleGoogleLogin = async (credentialResponse) => {

        setIsLoading(true);

        try {

            const response = await api.post("accounts/auth/social/google/", {
                access_token: credentialResponse.credential
            });

            if (response.status === 200) {
                setUser(response.data.user);
                setTimeout(() => navigate("/dashboard"), 1000);
            }

        } finally {
            setIsLoading(false);
        }
    };

    /* ---------------- SUBMIT ---------------- */

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!validateForm()) {
            dispatch(showNotification({
                message: "Please fix form errors",
                type: "error"
            }));
            return;
        }

        setIsLoading(true);

        try {

            if (isLogin) {

                const result = await dispatch(
                    Login({
                        username: formData.username,
                        password: formData.password
                    })
                ).unwrap();

                dispatch(showNotification({
                    message: "Login successful",
                    type: "success"
                }));

                setUser(result.user);
                navigate("/dashboard/");

                return;
            }

            const result = await dispatch(SignUp(formData)).unwrap();

            dispatch(showNotification({
                message: "Account created! Verification required.",
                type: "success"
            }));

            navigate("/otp/", {
                state: {
                    email: formData.email,
                    created: result.created_time,
                    type: "register"
                }
            });

        } catch (err) {

            dispatch(showNotification({
                message: err?.message || "Authentication error",
                type: "error"
            }));

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-2 overflow-hidden">

            <div className="w-full max-w-md">

                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-3">

                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-3">

                            <InputField
                                label="First"
                                name="first_name"
                                icon={<User />}
                                value={formData.first_name}
                                onChange={handleInputChange}
                                error={errors.first_name}
                                focused={focusedField}
                                setFocused={setFocusedField}
                            />

                            <InputField
                                label="Last"
                                name="last_name"
                                icon={<User />}
                                value={formData.last_name}
                                onChange={handleInputChange}
                                error={errors.last_name}
                                focused={focusedField}
                                setFocused={setFocusedField}
                            />

                        </div>
                    )}

                    {!isLogin && (
                        <InputField
                            label="Email"
                            name="email"
                            type="email"
                            icon={<Mail />}
                            value={formData.email}
                            onChange={handleInputChange}
                            error={errors.email}
                            focused={focusedField}
                            setFocused={setFocusedField}
                        />
                    )}

                    <InputField
                        label="Username"
                        name="username"
                        icon={<User />}
                        value={formData.username}
                        onChange={handleInputChange}
                        error={errors.username}
                        focused={focusedField}
                        setFocused={setFocusedField}
                    />

                    <div>

                        <label className="text-[10px] font-bold">Password</label>

                        <div className="relative">

                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" />

                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-10 py-2.5 rounded-xl"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>

                        </div>

                        {errors.password && (
                            <p className="text-red-500 text-[10px]">{errors.password}</p>
                        )}

                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl"
                    >
                        {isLoading ? "Loading..." : isLogin ? "Sign In" : "Start Journey"}
                    </button>

                    <div className="flex justify-center">
                        <GoogleLogin onSuccess={handleGoogleLogin}/>
                    </div>

                </form>

            </div>
        </div>
    );
}

const InputField = ({ label, name, type = "text", icon, value, onChange, error, focused, setFocused }) => (

    <div className="space-y-1 flex-1">

        <label className="text-[10px] font-bold">{label}</label>

        <div className="relative">

            {React.cloneElement(icon, {
                className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
            })}

            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(name)}
                onBlur={() => setFocused(null)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl"
            />

        </div>

        {error && (
            <p className="text-red-500 text-[10px]">{error}</p>
        )}

    </div>
);

export default LoginPage;