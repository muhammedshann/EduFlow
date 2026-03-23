import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axios";
import { showNotification } from "./NotificationSlice";

export const fetchWallet = createAsyncThunk(
    'wallet/fetchWallet',
    async ( _, {dispatch, rejectWithValue }) => {
        try {
            const response = await api.get('accounts/wallet/');
            console.log(response);
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error || err.message || "Failed to fetch wallet";
            dispatch(showNotification({
                message: errorMsg,
                type: "error"
            }));
            return rejectWithValue(errorMsg);
        }
    }
);

export const WalletDeposit = createAsyncThunk(
    'wallet/WalletDeposit',
    async(amount, {dispatch, rejectWithValue}) => {
        try {
            const response = await api.post('/accounts/wallet-deposite/',{'amount': amount});
            dispatch(showNotification({
                message: response.data.message,
                type: "success"
            }));
            return response.data;
        } catch(err) {
            console.log(err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.response?.data?.detail || err.message || "Deposit failed";
            dispatch(showNotification({
                message: errorMsg,
                type: "error"
            }));
            return rejectWithValue(errorMsg);
        }
    }
)



const walletSlice = createSlice({
    name: "wallet",
    initialState: {
        balance: 0,
        history: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWallet.pending, (state) => { state.loading = true })
            .addCase(fetchWallet.fulfilled, (state, action) => {
                state.loading = false;
                state.balance = action.payload.balance;
                state.history = action.payload.history;
            })
            .addCase(fetchWallet.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default walletSlice.reducer;
