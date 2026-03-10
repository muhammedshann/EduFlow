import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import { Login, SignUp } from "../../Redux/AuthSlice";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext";
import { GoogleLogin } from '@react-oauth/google';
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

    /* ---------- NEW: validation state ---------- */
    const [errors, setErrors] = useState({});

    /* ---------- NEW: validation logic ---------- */
    const validateField = (name, value) => {

        let error = "";

        switch (name) {

            case "first_name":
            case "last_name":

                if (!value.trim()) {
                    error = "This field is required";

                } else if (!/^[A-Za-z]+$/.test(value)) {
                    error = "Only alphabetic characters allowed";

                } else if (value.length < 2) {
                    error = "Minimum 2 characters";

                } else if (value.length > 30) {
                    error = "Maximum 30 characters";
                }

                break;

            case "username":
                if (!value.trim()) {
                    error = "Username required";
                } else if (!/^[A-Za-z][A-Za-z0-9_]{2,19}$/.test(value)) {
                    error = "3-20 chars, start with letter, letters/numbers/_ only";
                }
                break;

            case "email":
                if (!value.trim()) {
                    error = "Email required";
                } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
                    error = "Invalid email address";
                }
                break;

            case "password":
                if (!value.trim()) {
                    error = "Password required";
                } else if (value.length < 8) {
                    error = "Minimum 8 characters";
                } else if (!/(?=.*[A-Za-z])/.test(value)) {
                    error = "Must contain letters";
                } else if (!/(?=.*\d)/.test(value)) {
                    error = "Must contain a number";
                }
                break;

            default:
                break;
        }

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        return error;
    };

    const handleGoogleLogin = async (credentialResponse) => {
        setIsLoading(true);
        try {
            const response = await api.post('accounts/auth/social/google/', {
                access_token: credentialResponse.credential,
            });
            if (response.status === 200) {
                setUser(response.data.user);
                setTimeout(() => navigate('/dashboard'), 1000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fields = isLogin
            ? ["username", "password"]
            : ["first_name", "last_name", "username", "email", "password"];

        let hasError = false;

        fields.forEach(field => {
            const err = validateField(field, formData[field]);
            if (err) hasError = true;
        });

        if (hasError) {
            dispatch(showNotification({
                message: "Please fix form errors",
                type: "error"
            }));
            return;
        }

        const { username, email, password } = formData;

        setIsLoading(true);

        try {

            if (isLogin) {

                const loginData = { username, password };
                const result = await dispatch(Login(loginData)).unwrap();

                dispatch(showNotification({ message: "Login successful", type: "success" }));
                setUser(result.user);
                navigate('/dashboard/');
                return;
            }

            const result = await dispatch(SignUp(formData)).unwrap();

            dispatch(showNotification({
                message: "Account created! Verification required.",
                type: "success"
            }));

            navigate('/otp/', {
                state: {
                    email: formData.email,
                    created: result.created_time,
                    type: 'register'
                }
            });

        } catch (err) {

            dispatch(showNotification({
                message: err?.message || "An error occurred during authentication",
                type: "error"
            }));

        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {

        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        /* real-time validation */
        validateField(name, value);
    };

    return (
        <div className="h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-2 transition-colors duration-500 overflow-hidden">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">

                {/* UI unchanged */}

                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-3 transition-colors duration-300">

                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="First"
                                name="first_name"
                                icon={<User />}
                                value={formData.first_name}
                                onChange={handleInputChange}
                                focused={focusedField}
                                setFocused={setFocusedField}
                                error={errors.first_name}
                            />

                            <InputField
                                label="Last"
                                name="last_name"
                                icon={<User />}
                                value={formData.last_name}
                                onChange={handleInputChange}
                                focused={focusedField}
                                setFocused={setFocusedField}
                                error={errors.last_name}
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
                            focused={focusedField}
                            setFocused={setFocusedField}
                            error={errors.email}
                        />
                    )}

                    <InputField
                        label="Username"
                        name="username"
                        icon={<User />}
                        value={formData.username}
                        onChange={handleInputChange}
                        focused={focusedField}
                        setFocused={setFocusedField}
                        error={errors.username}
                    />

                    {/* password unchanged except error message */}

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
                            Password
                        </label>

                        <div className={`relative ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" />

                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleInputChange}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none text-xs"
                                placeholder="••••••••"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        {errors.password && (
                            <p className="text-red-500 text-[10px] mt-1">{errors.password}</p>
                        )}
                    </div>

                </form>
            </div>
        </div>
    );
}

const InputField = ({
    label,
    name,
    type = "text",
    icon,
    value,
    onChange,
    focused,
    setFocused,
    error
}) => (

    <div className="space-y-1 flex-1">

        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
            {label}
        </label>

        <div className={`relative ${focused === name ? 'scale-[1.01]' : ''}`}>
            {React.cloneElement(icon, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" })}

            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(name)}
                onBlur={() => setFocused(null)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none text-xs"
                placeholder={label}
            />
        </div>

        {error && (
            <p className="text-red-500 text-[10px] mt-1">{error}</p>
        )}

    </div>
);

export default LoginPage;