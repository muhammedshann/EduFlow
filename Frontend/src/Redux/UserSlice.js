import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export const profile = createAsyncThunk(
    'user/profile',
    async() => {
        try {
            const res = await api.get('profile/')
            console.log(res);
            
        } catch (err) {
            console.log(err);
            
        }
    }
)