import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const AdminFetchHabit = createAsyncThunk(
    'admin/AdminFetchHabit',
    async(_,{rejectWithValue}) => {
        try {
            const response = await api.get('/admin/habits/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "fetch failed")
        }
    }
)