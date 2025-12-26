import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const FetchWallet = createAsyncThunk(
    'admin/FetchWallet',
    async(_,{rejectWithValue}) => {
        try {
            const response = await api.get('/admin/wallet/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "Fetch Wallet failed")
        }
    }
)