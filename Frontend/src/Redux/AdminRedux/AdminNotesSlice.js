import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const AdminFetchNotes = createAsyncThunk(
    'admin/AdminFetchNotes',
    async(_,{rejectWithValue}) => {
        try {
            const response = await api.get('/admin/notes/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "fetch failed")
        }
    }
)