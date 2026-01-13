import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const AdminFetchPricing= createAsyncThunk(
    'admin/AdminFetchPricing',
    async(_,{rejectWithValue}) => {
        try {
            const response = await api.get('/subscriptions/pricing/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "fetch failed")
        }
    }
)

export const AdminFetchBundles= createAsyncThunk(
    'admin/AdminFetchBundles',
    async(_,{rejectWithValue}) => {
        try {
            const response = await api.get('/subscriptions/bundles/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "fetch failed")
        }
    }
)

export const AdminCreatePricing= createAsyncThunk(
    'admin/AdminCreatePricing',
    async(newRate,{rejectWithValue}) => {
        try {
            const response = await api.patch('/subscriptions/pricing/', { rate_per_credit: newRate });
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "fetch failed")
        }
    }
)

export const AdminCreateBundles= createAsyncThunk(
    'admin/AdminCreateBundles',
    async(formData,{rejectWithValue}) => {
        try {
            const response = await api.post('/subscriptions/bundles/', formData);
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "fetch failed")
        }
    }
)

export const AdminUpdateBundles = createAsyncThunk(
    'admin/AdminUpdateBundles',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.patch('/subscriptions/bundles/', payload);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Update failed");
        }
    }
);

export const AdminDeleteBundles = createAsyncThunk(
    'admin/AdminDeleteBundles',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete('/subscriptions/bundles/', {data: { id }});
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Update failed");
        }
    }
);

