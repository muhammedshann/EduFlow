import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// --- Async Thunks ---

export const FetchCredit = createAsyncThunk(
    'subscriptions/FetchCredit',
    async(_, { rejectWithValue }) => {
        try {
            const response = await api.get('/subscriptions/credit/');
            return response.data;
        } catch(err) {
            return rejectWithValue(err.response?.data || "Fetch credit failed");
        }
    }
);

export const RzpCreateOrder = createAsyncThunk(
    'subscriptions/RzpCreateOrder',
    async(payload, { rejectWithValue }) => {
        try {
            const response = await api.post('/subscriptions/create-order/', payload);
            return response.data;
        } catch(err) {
            return rejectWithValue(err.response?.data || "Order creation failed");
        }
    }
);

export const RzpVerifyOrder = createAsyncThunk(
    'subscriptions/RzpVerifyOrder',
    async(payload, { rejectWithValue }) => {
        try {
            const response = await api.post('/subscriptions/verify-payment/', payload);
            return response.data;
        } catch(err) {
            return rejectWithValue(err.response?.data || "Verification failed");
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