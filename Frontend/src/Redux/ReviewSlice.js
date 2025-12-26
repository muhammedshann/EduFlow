import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { showNotification } from "./NotificationSlice";

export const FetchReviews = createAsyncThunk(
    'review/FetchReviews',
    async(_,{rejectWithValue}) => {
        try {
            const response = await api.get('/review/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "Fetch review failed")
        }
    }
)
