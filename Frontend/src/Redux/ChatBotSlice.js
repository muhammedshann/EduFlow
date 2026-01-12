import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { showNotification } from "./NotificationSlice";

export const FetchChatBot = createAsyncThunk(
    'ChatBot/FetchChatBot',
    async(_,{rejectWithValue}) => {
        try {
            const response = await api.get('/chat-bot/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "Fetch chatbot failed")
        }
    }
)

export const ClearChatBot = createAsyncThunk(
    'ChatBot/ClearChatBot',
    async(_,{rejectWithValue}) => {
        try {
            const response = await api.delete('/chat-bot/delete/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "delete chatbot failed")
        }
    }
)