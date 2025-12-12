import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { showNotification } from "./NotificationSlice";

export const FetchGroup = createAsyncThunk(
    'habit/FetchGroup',
    async (_,{rejectWithValue}) => {
        try {
            const response = await api.get('/groups/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "Fetch group failed")
        }
    }
)

export const CreateGroup = createAsyncThunk(
    'habit/CreateGroup',
    async (data,{dispatch,rejectWithValue}) => {
        try {
            const response = await api.post('/groups/', data);
            console.log(response.data);
            dispatch(showNotification({
                message: response.data.message,
                type: "success"
            }));
            return response.data
        } catch(err) {
            console.log(err);
            dispatch(showNotification({
                message: err.response || 'failed',
                type: "error"
            }));
            return rejectWithValue(err.response?.data || "create group failed")
        }
    }
)

export const JoinGroup = createAsyncThunk(
    'habit/JoinGroup',
    async (id,{dispatch,rejectWithValue}) => {
        try {
            const response = await api.post('/groups/join/', {id});
            console.log(response.data);
            dispatch(showNotification({
                message: 'successfully joined',
                type: "success"
            }));
            return response.data
        } catch(err) {
            console.log(err);
            dispatch(showNotification({
                message: err.response,
                type: "error"
            }));
            return rejectWithValue(err.response?.data || "create group failed")
        }
    }
)

export const fetchGroupDetails = createAsyncThunk(
    'habit/JoinGroup',
    async (id,{rejectWithValue}) => {
        try {
            const response = await api.post('/groups/group-details/', {id});
            console.log(response.data.message);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "get group failed")
        }
    }
)

export const LeaveGroup = createAsyncThunk(
    'habit/LeaveGroup',
    async (id,{dispatch,rejectWithValue}) => {
        try {
            const response = await api.post('/groups/leave-group/', {id});
            console.log(response.data);
            dispatch(showNotification({
                message: response.data.message ,
                type: "success"
            }));
            return response.data
        } catch(err) {
            console.log(err);
            dispatch(showNotification({
                message: err.response,
                type: "error"
            }));
            return rejectWithValue(err.response?.data || "leaving group failed")
        }
    }
)