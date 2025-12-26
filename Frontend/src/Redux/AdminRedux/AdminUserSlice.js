import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { showNotification } from "../NotificationSlice";

export const GetUsers = createAsyncThunk(
    'admin/getUsers',
    async(_,{dispatch,rejectWithValue}) => {
        try {
            const response = await api.get('/admin/users/');
            console.log(response.data);
            dispatch(showNotification({
                message: response.data.message,
                type: "success"
            }));
            return response.data
        } catch(err) {
            console.log(err);
            dispatch(showNotification({
                message: err.data?.message,
                type: "error"
            }));
            return rejectWithValue(err.response?.data || "fetch failed")
        }
    }
)

export const CreateUser = createAsyncThunk(
    'admin/CreateUser',
    async(formData,{dispatch,rejectWithValue}) => {
        try {
            const response = await api.post('/admin/users/create/',formData);
            console.log(response.data);
            dispatch(showNotification({
                message: response.data.message,
                type: "success"
            }));
            return response.data
        } catch(err) {
            console.log(err);
            dispatch(showNotification({
                message: err.data?.message,
                type: "error"
            }));
            return rejectWithValue(err.response?.data || "fetch failed")
        }
    }
)

export const EditUser = createAsyncThunk(
    'admin/EditUser',
    async(formData,{dispatch,rejectWithValue}) => {
        try {
            const response = await api.put(`/admin/users/edit/${formData.id}/`,formData);
            console.log(response.data);
            dispatch(showNotification({
                message: response.data.message,
                type: "success"
            }));
            return response.data
        } catch(err) {
            console.log(err);
            dispatch(showNotification({
                message: err.data?.message,
                type: "error"
            }));
            return rejectWithValue(err.response?.data || "fetch failed")
        }
    }
)

export const DeleteUser = createAsyncThunk(
    'admin/DeleteUser',
    async(user,{dispatch,rejectWithValue}) => {
        try {
            const response = await api.delete(`/admin/users/delete/${user.id}/`);
            console.log(response.data);
            dispatch(showNotification({
                message: response.data.message,
                type: "success"
            }));
            return response.data
        } catch(err) {
            console.log(err);
            dispatch(showNotification({
                message: err.data?.message,
                type: "error"
            }));
            return rejectWithValue(err.response?.data || "delete failed")
        }
    }
)