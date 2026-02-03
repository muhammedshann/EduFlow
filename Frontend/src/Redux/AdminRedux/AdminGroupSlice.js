import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const AdminGroup = createAsyncThunk(
    'admin/AdminGroup',
    async(_,{rejectWithValue}) => {
        try {
            const response = await api.get('/admin/groups/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "fetch failed")
        }
    }
)

export const AdminHanldeGroupDelete = createAsyncThunk(
    'admin/AdminHanldeGroupDelete',
    async(id,{rejectWithValue}) => {
        try {
            const response = await api.delete('/admin/groups/delete/', id);
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "delete failed")
        }
    }
)