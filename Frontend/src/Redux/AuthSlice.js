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
            let errorMessage = 'Something went wrong';
            if (err.response?.data?.errors) {
                errorMessage = Object.entries(err.response.data.errors)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join(' | ');
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
                dispatch(showNotification({
                    message: errorMessage,
                    type: "error"
                }));
            }
            return rejectWithValue(errorMessage);
        }
    }
);

export const Login = createAsyncThunk(
    "auth/login",
    async (userData, {dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('accounts/login/', userData, { });
            dispatch(showNotification({
                message: "Login successful!",
                type: "success"
            }));
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.errors?.non_field_errors?.[0]||
                "Login failed";

            dispatch(showNotification({
                message: errorMsg,
                type: "error"
            }));
            return rejectWithValue(err.response?.data || err.message);
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
            dispatch(showNotification({
                message: err,
                type: "error"
            }));

            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verify_otp',
    async ({ email, otp, register }, {dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('accounts/verify-otp/', { email, otp, register });
            dispatch(showNotification({
                message: "OTP verified!",
                type: "success"
            }));
            return response.data;
        } catch (err) {
            dispatch(showNotification({
                message: err,
                type: "error"
            }));
            return rejectWithValue(err.response?.data?.message || err.message);
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
            dispatch(showNotification({
                message: err,
                type: "error"
            }));
            return rejectWithValue(err.response?.data?.message || err.message);
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
                // state.AccessToken = action.payload.access;
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
