import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { showNotification } from "../NotificationSlice";

export const FetchLiveTranscription = createAsyncThunk(
    'liveTranscription/FetchLiveTranscription',
    async( _,{dispatch, rejectWithValue}) => {
        try {
            const response = await api.get('/admin/live-transcription/');
            console.log(response.data);
            return response.data
        } catch(err) {
            const errorMessage =
                err.response?.data?.error ||
                err.response?.data ||
                err.message ||
                'fetch note failed';

            dispatch(showNotification({
                message: errorMessage,
                type: 'error',
            }));

            return rejectWithValue(errorMessage);
        }
    }
)