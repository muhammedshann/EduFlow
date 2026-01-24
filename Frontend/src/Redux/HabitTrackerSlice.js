import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { showNotification } from "./NotificationSlice";

export const FetchHabit = createAsyncThunk(
    'habit/FetchHabit',
    async (_,{rejectWithValue}) => {
        try {
            const response = await api.get('/habit/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "Fetch habit failed")
        }
    }
)

export const AddHabit = createAsyncThunk(
    'habit/AddHabit',
    async ({title,description},{dispatch,rejectWithValue}) => {
        try {
            const response = await api.post('/habit/add/', {title, description});
            console.log(response.data);
            dispatch(showNotification({
                message: response.data.message,
                type: "success"
            }));
            return response.data
        } catch(err) {
            console.log(err);
            dispatch(showNotification({
                message: response.data.message,
                type: "success"
            }));
            return rejectWithValue(err.response?.data || "add habit failed")
        }
    }
)

export const ToggleHabit = createAsyncThunk(
    'habit/ToggleHabit',
    async ({habit_id,completed},{dispatch,rejectWithValue}) => {
        try {
            const response = await api.post('/habit/toggle/', {habit_id, completed});
            console.log(response.data);
            dispatch(showNotification({
                message: response.data.message,
                type: "success"
            }));
            return response.data
        } catch(err) {
            console.log(err);
            dispatch(showNotification({
                message: response.data.message,
                type: "success"
            }));
            return rejectWithValue(err.response?.data || "toggle habit failed")
        }
    }
)

export const WeeklyStatsHabit = createAsyncThunk(
    'habit/WeeklyStatsHabit',
    async (_,{rejectWithValue}) => {
        try {
            const response = await api.get('/habit/stats/weekly/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "stats weekly habit failed")
        }
    }
)

export const StreakStatsHabit = createAsyncThunk(
    'habit/StreakStatsHabit',
    async (_,{rejectWithValue}) => {
        try {
            const response = await api.get('/habit/stats/streak/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "stats streak habit failed")
        }
    }
)

export const DeleteHabit = createAsyncThunk(
    'habit/DeleteHabit',
    async (id,{rejectWithValue}) => {
        try {
            const response = await api.delete(`/habit/delete/${id}/`);
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "deleting habit failed")
        }
    }
)