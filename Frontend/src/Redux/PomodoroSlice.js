import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { showNotification } from "./NotificationSlice";

export const FetchPomodoro = createAsyncThunk(
    'promodoro/FetchPromodoro',
    async(_,{rejectWithValue}) => {
        try {
            const response = await api.get('/pomodoro/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "Fetch pomodoro failed")
        }
    }
)

export const UpdatePomodoro = createAsyncThunk(
    'promodoro/UpdatePromodoro',
    async(formData,{dispatch, rejectWithValue}) => {
        try {
            const response = await api.post('/pomodoro/', formData);
            console.log(response.data);
            dispatch(showNotification({
                message: response.data.message,
                type: "success"
            }));
            return response.data.data
        } catch(err) {
            console.log(err);
            dispatch(showNotification({
                message: err.response.data.error || "Update failed",
                type: "error"
            }));
            return rejectWithValue(err.response.data.error || "Update failed")
        }
    }
)

export const SavePomodoro = createAsyncThunk(
    'promodoro/SavePromodoro',
    async(Data,{dispatch,rejectWithValue}) => {
        try {
            const response = await api.post('/pomodoro/save/', Data);
            console.log(response.data);
            dispatch(showNotification({
                message: response.data.message,
                type: "success"
            }));
            return response.data
        } catch(err) {
            console.log(err);
            dispatch(showNotification({
                message: err.response.data.error,
                type: "error"
            }));
            return rejectWithValue(err.response.data.error || "session not Completed")
        }
    }
)

export const FetchDailyStats = createAsyncThunk(
    "pomodoro/daily",
    async(_, {rejectWithValue}) => {
        try {
            const res = await api.get("/pomodoro/stats/daily/");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed");
        }
    }
);

export const FetchWeeklyStats = createAsyncThunk(
    "pomodoro/weekly",
    async(_, {rejectWithValue}) => {
        try {
            const res = await api.get("/pomodoro/stats/weekly/");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed");
        }
    }
);

export const FetchStreak = createAsyncThunk(
    "pomodoro/streak",
    async(_, {rejectWithValue}) => {
        try {
            const res = await api.get("/pomodoro/stats/streak/");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed");
        }
    }
);
