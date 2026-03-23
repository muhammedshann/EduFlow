import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { showNotification } from "./NotificationSlice";

// --- Async Thunks ---

export const FetchCredit = createAsyncThunk(
    'subscriptions/FetchCredit',
    async(_, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.get('/subscriptions/credit/');
            return response.data;
        } catch(err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error || err.message || "Fetch credit failed";
            dispatch(showNotification({
                message: errorMsg,
                type: "error"
            }));
            return rejectWithValue(errorMsg);
        }
    }
);

export const RzpCreateOrder = createAsyncThunk(
    'subscriptions/RzpCreateOrder',
    async(payload, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('/subscriptions/create-order/', payload);
            return response.data;
        } catch(err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error || err.message || "Order creation failed";
            dispatch(showNotification({
                message: errorMsg,
                type: "error"
            }));
            return rejectWithValue(errorMsg);
        }
    }
);

export const RzpVerifyOrder = createAsyncThunk(
    'subscriptions/RzpVerifyOrder',
    async(payload, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post('subscriptions/verify-payment/', payload);
            return response.data;
        } catch(err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error || err.message || "Verification failed";
            dispatch(showNotification({
                message: errorMsg,
                type: "error"
            }));
            return rejectWithValue(errorMsg);
        }
    }
);

export const WalletPayment = createAsyncThunk(
    'subscriptions/WalletPayment',
    async (payload, { dispatch, rejectWithValue }) => {
        try {
            // Use 'api' instead of 'axios'
            // Path should NOT start with /api/ because baseURL already has it
            const response = await api.post('subscriptions/wallet-payment/', payload);
            dispatch(showNotification({
                message: response.data?.message || "Wallet payment successful!",
                type: "success"
            }));
            return response.data;
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || err.response?.data?.detail || err.message || "Wallet payment failed";
            dispatch(showNotification({
                message: message,
                type: "error"
            }));
            return rejectWithValue(message);
        }
    }
);

const subscriptionSlice = createSlice({
    name: "subscriptions",
    initialState: {
        userCredits: null,      // Holds the credit object from backend
        loading: false,         // Global loading state for subscriptions
        error: null,            // Global error state
    },
    reducers: {
        clearSubscriptionError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle FetchCredit
            .addCase(FetchCredit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(FetchCredit.fulfilled, (state, action) => {
                state.loading = false;
                console.log("🔥 DATA FROM BACKEND:", action.payload);
                state.userCredits = action.payload; // Store credits in global state
            })
            .addCase(FetchCredit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearSubscriptionError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;