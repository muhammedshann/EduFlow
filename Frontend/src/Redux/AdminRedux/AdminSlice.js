import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const AdminLogin = createAsyncThunk(
    'admin/login',
    async(formData,{rejectWithValue}) => {
        try {
            const response = await api.post('/admin/login/', formData);
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "login failed")
        }
    }
)