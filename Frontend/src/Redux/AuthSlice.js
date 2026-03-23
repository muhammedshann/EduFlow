import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axios";
import { showNotification } from "./NotificationSlice";

// ------------------- Thunks -------------------
export const SignUp = createAsyncThunk(
    "auth/signup",
    async (userData, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('accounts/register/', userData);
            dispatch(showNotification({
                message: "OTP sent!",
                type: "success"
            }));
            return response.data;
        } catch (err) {
            let errorMessage = 'Something went wrong. Please try again.';
            
            if (err.response?.data) {
                const data = err.response.data;
                const errorSource = data.errors || data;

                if (typeof errorSource === 'object' && errorSource !== null) {
                    // This takes { email: ["Already exists"] } 
                    // and turns it into a flat array: ["Already exists"]
                    const messages = Object.values(errorSource).flat();
                    
                    if (messages.length > 0) {
                        // Grab only the first error message to keep the notification clean
                        errorMessage = messages[0]; 
                    }
                } else if (typeof errorSource === 'string') {
                    errorMessage = errorSource;
                }
            } else if (err.message) {
                // Fallback for network issues (e.g., server down)
                errorMessage = "Network error. Please check your connection.";
            }

            dispatch(showNotification({
                message: errorMessage,
                type: "error"
            }));
            
            return rejectWithValue(errorMessage);
        }
    }
);

export const Login = createAsyncThunk(
    "auth/login",
    async (userData, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('accounts/login/', userData);
            dispatch(showNotification({
                message: "Welcome back!",
                type: "success"
            }));
            return response.data;
        } catch (err) {
            const data = err.response?.data;
            let errorMsg = "An error occurred during authentication";

            // --- DEEP ERROR EXTRACTION ---
            if (data) {
                // 1. Check if it's nested in "errors" (your serializer.errors)
                const source = data.errors || data;

                if (typeof source === 'object' && source !== null) {
                    // Flatten all values: e.g., { non_field_errors: ["Invalid..."], email: ["Req"] }
                    // becomes ["Invalid...", "Req"]
                    const messages = Object.values(source).flat();
                    if (messages.length > 0) {
                        errorMsg = messages[0];
                    }
                } 
                // 2. Check for standard DRF "detail" (Authentication failed)
                else if (data.detail) {
                    errorMsg = data.detail;
                }
                // 3. Check for a direct string
                else if (typeof data === 'string') {
                    errorMsg = data;
                }
            } else if (err.message) {
                errorMsg = err.message;
            }

            dispatch(showNotification({
                message: errorMsg,
                type: "error"
            }));

            return rejectWithValue(errorMsg);
        }
    }
);

export const generateOtp = createAsyncThunk(
    'auth/generate_otp',
    async (email, {dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('accounts/generate-otp/', { email });
            dispatch(showNotification({
                message: "OTP sent successfully!",
                type: "success"
            }));
            return response.data;
        } catch (err) {
            // FIXED: Extracting string message instead of passing 'err'
            const data = err.response?.data;
            let errorMsg = "Failed to send OTP";

            // Check if it's a field error from the serializer (like your email check)
            if (data && typeof data === 'object' && !data.message) {
                errorMsg = Object.values(data).flat()[0]; // Gets "Email not registered"
            } else {
                errorMsg = data?.message || err.message;
            }
            dispatch(showNotification({
                message: errorMsg,
                type: "error"
            }));
            return rejectWithValue(errorMsg);
        }
    }
);

export const generateOtpEmail = createAsyncThunk(
    'auth/generateOtpEmail',
    async (email, {dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('accounts/generate-otp-email/', { email });
            dispatch(showNotification({
                message: "OTP sent successfully!",
                type: "success"
            }));
            return response.data;
        } catch (err) {
            // FIXED: Extracting string message instead of passing 'err'
            const data = err.response?.data;
            let errorMsg = "Failed to send OTP";

            // Check if it's a field error from the serializer (like your email check)
            if (data && typeof data === 'object' && !data.message) {
                errorMsg = Object.values(data).flat()[0]; // Gets "Email not registered"
            } else {
                errorMsg = data?.message || err.message;
            }
            dispatch(showNotification({
                message: errorMsg,
                type: "error"
            }));
            return rejectWithValue(errorMsg);
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verify_otp',
    async ({ email, otp, register }, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('accounts/verify-otp/', { email, otp, register });
            dispatch(showNotification({
                message: response.data?.message || "OTP verified!",
                type: "success"
            }));
            return response.data;
        } catch (err) {
            let errorMsg = "OTP verification failed";
            
            const data = err.response?.data;
            // Handle both {"message": {"non_field_errors": [...]}} and standard DRF structures
            const errorSource = data?.message || data?.errors || data;

            if (errorSource && typeof errorSource === 'object') {
                const messages = Object.values(errorSource).flat();
                if (messages.length > 0) {
                    errorMsg = messages[0];
                }
            } else if (typeof data === 'string') {
                errorMsg = data;
            }

            dispatch(showNotification({
                message: errorMsg,
                type: "error"
            }));
            
            return rejectWithValue(errorMsg);
        }
    }
);

export const verifyOtpEmail = createAsyncThunk(
    'auth/verifyOtpEmail',
    async ({ email, otp }, {dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('accounts/verify-otp-email/', { email, otp });
            dispatch(showNotification({
                message: "OTP verified!",
                type: "success"
            }));
            return response.data;
        } catch (err) {
            // FIXED: Extracting string message instead of passing 'err'
            const errorMsg = err.response?.data?.message || err.message || "OTP verification failed";
            dispatch(showNotification({
                message: errorMsg,
                type: "error"
            }));
            return rejectWithValue(errorMsg);
        }
    }
);

export const ResetPassword = createAsyncThunk(
    'auth/reset_password',
    async ({ password, email, otp }, {dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('accounts/reset-password/', { password, email, otp });
            dispatch(showNotification({
                message: "Password reset successfully!",
                type: "success"
            }));
            return response.data;
        } catch (err) {
            const data = err.response?.data;
            let errorMsg = "Password reset failed";

            // If the serializer returns an error like {"otp": ["Invalid request."]}
            if (data && typeof data === 'object' && !data.message) {
                // Flatten values to get the first string message
                errorMsg = Object.values(data).flat()[0]; 
            } else {
                errorMsg = data?.message || err.message;
            }

            dispatch(showNotification({
                message: errorMsg,
                type: "error"
            }));
            return rejectWithValue(errorMsg);
        }
    }
);

export const deleteUserAccount = createAsyncThunk(
    'auth/deleteUserAccount',
    async (_, { dispatch, rejectWithValue }) => {
        console.log("Attempting to delete user..."); // Check if this shows in console
        try {
            // Ensure this matches your path('delete-user/', ...) in urls.py
            const response = await api.delete('accounts/delete-user/'); 
            
            dispatch(showNotification({
                message: "Account Deleted Successfully",
                type: "success"
            }));
            localStorage.clear();
            
            return response.data;
        } catch (err) {
            console.error("Delete API Error:", err.response); // Debug the actual response
            const errorMessage = err.response?.data?.message || err.response?.data?.detail || "Failed to delete account";
            dispatch(showNotification({
                message: errorMessage,
                type: "error"
            }));
            return rejectWithValue(errorMessage);
        }
    }
);

// ------------------- Slice -------------------

const AuthSlice = createSlice({
    name: 'auth',
    initialState: {
        User: null,
        RefreshToken: null,
        AccessToken: null,
        Loading: false,
        message: null,
        messageType: null,
    },
    reducers: {
        Logout: (state) => {
            state.User = null;
            state.RefreshToken = null;
            state.AccessToken = null;
            state.message = null;
            localStorage.clear();
        },
        clearMessage: (state) => {
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // SignUp
            .addCase(SignUp.pending, (state) => { state.Loading = true; state.message = null; })
            .addCase(SignUp.fulfilled, (state) => { state.Loading = false; state.message = 'OTP sent!'; state.messageType = "success";})
            .addCase(SignUp.rejected, (state, action) => { state.Loading = false; state.message = action.payload; state.messageType = "error"; })

            // Login
            .addCase(Login.pending, (state) => { state.Loading = true; state.message = null; })
            .addCase(Login.fulfilled, (state, action) => {
                state.Loading = false;
                state.User = action.payload.user;
                // state.RefreshToken = action.payload.refresh;
                state.AccessToken = action.payload.access;
                state.message = 'Login successful!';
                state.messageType = "success";
            })
            .addCase(Login.rejected, (state, action) => { state.Loading = false; state.message = action.payload; state.messageType = "error"; })

            // generateOtp
            .addCase(generateOtp.pending, (state) => { state.Loading = true; state.message = null; })
            .addCase(generateOtp.fulfilled, (state) => { state.Loading = false; state.message = 'OTP sent successfully!'; state.messageType = "success"; })
            .addCase(generateOtp.rejected, (state, action) => { state.Loading = false; state.message = action.payload; state.messageType = "error"; })

            // verifyOtp
            .addCase(verifyOtp.pending, (state) => { state.Loading = true; state.message = null; })
            .addCase(verifyOtp.fulfilled, (state) => { state.Loading = false; state.message = 'OTP verified!'; state.messageType = "success"; })
            .addCase(verifyOtp.rejected, (state, action) => { state.Loading = false; state.message = action.payload; state.messageType = "error";})

            // ResetPassword
            .addCase(ResetPassword.pending, (state) => { state.Loading = true; state.message = null; })
            .addCase(ResetPassword.fulfilled, (state) => { state.Loading = false; state.message = 'Password reset successfully!'; state.messageType = "success"; })
            .addCase(ResetPassword.rejected, (state, action) => { state.Loading = false; state.message = action.payload; state.messageType = "error"; });
    }
});

export const { Logout, clearMessage } = AuthSlice.actions;
export default AuthSlice.reducer;
