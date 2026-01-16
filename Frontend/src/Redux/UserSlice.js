import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axios";
import { showNotification } from "./NotificationSlice";


export const updateProfile = createAsyncThunk(
    'user/updateProfile',
    async(formData,{dispatch, rejectWithValue}) => {
        try {
            const result = await api.put('accounts/update-profile/',formData);
            dispatch(showNotification({
                message: result.data.message,
                type: "success"
            }));
            return result.data
        } catch(err) {
            dispatch(showNotification({
                message: typeof err === "string"
                    ? err
                    : JSON.stringify(err),
                type: "error"
            }));
            return rejectWithValue(err.response.data.errors);
        }
    }
)

export const updatePassword = createAsyncThunk(
    'user/updatePassword',
    async({old_password,new_password}, {dispatch, rejectWithValue}) => {
        try {
            const result = await api.put('accounts/update-password/',{old_password,new_password});
            dispatch(showNotification({
                message: result.data.message,
                type: "success"
            }));
            return result.data;
        } catch(err) {
            const backendError =
                err.response?.data?.error ||
                err.response?.data?.detail ||
                Object.values(err.response?.data || {})[0]?.[0] ||
                "Update failed";

            dispatch(showNotification({
                message: backendError,
                type: "error"
            }));
            return rejectWithValue(err.response?.data);
        }
    }
)

export const updateProfileImage = createAsyncThunk(
    'user/changeProfile',
    async(formData,{dispatch,rejectWithValue}) => {
        try {
            const response = await api.put('/accounts/update-profile-image/',formData);
            console.log(response.data);
            dispatch(showNotification({
                message: response.data.message,
                type: "success"
            }));
            return response.data
            
        }catch(err){
            console.log(err);
            dispatch(showNotification({
                message: err.response?.data?.message || "Upload failed",
                type: "error"
            }));
            return rejectWithValue(err.response?.data);
        }
    }
)

export const FetchUserSubscription = createAsyncThunk(
    'user/FetchUserSubscription',
    async(formData,{dispatch,rejectWithValue}) => {
        try {
            const response = await api.get('/accounts/subscription-plans/',formData);
            console.log(response.data);
            return response.data
            
        }catch(err){
            console.log(err);
            dispatch(showNotification({
                message: err.response?.data?.message || "Upload failed",
                type: "error"
            }));
            return rejectWithValue(err.response?.data);
        }
    }
)



const UserSlice = createSlice({
    name:'user',
    initialState: {
        Loading: false,
        message: null,
        messageType: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(updateProfile.pending, (state) => { state.Loading = true})
            .addCase(updateProfile.fulfilled, (state,action) => { state.Loading = false, state.message = action.payload.message, state.messageType='success'})
            .addCase(updateProfile.rejected, (state,action) => { state.Loading = false, state.message = action.payload, state.messageType='error'})
    }
})

export default UserSlice.reducer;