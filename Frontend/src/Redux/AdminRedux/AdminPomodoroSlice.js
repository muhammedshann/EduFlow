import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const AdminPomodoro = createAsyncThunk(
    'admin/AdminPomodoro',
    async(_,{rejectWithValue}) => {
        try {
            const response = await api.get('/admin/pomodoro/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "fetch failed")
        }
    }
)