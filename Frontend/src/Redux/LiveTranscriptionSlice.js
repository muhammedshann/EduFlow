import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { showNotification } from "./NotificationSlice";

export const SaveLiveNote = createAsyncThunk(
    'liveTranscription/SaveLiveNote',
    async( note,{dispatch,rejectWithValue}) => {
        try {
            const response = await api.post('/live-transcription/', note);
            console.log(response.data);
            dispatch(showNotification({
                message: 'note saved successfully',
                type: "success"
            }));
            return response.data
        } catch(err) {
            const errorMessage =
                err.response?.data?.error ||
                err.response?.data ||
                err.message ||
                'Save note failed';

            dispatch(showNotification({
                message: errorMessage,
                type: 'error',
            }));

            return rejectWithValue(errorMessage);
        }
    }
)

export const FetchNotes = createAsyncThunk(
    'liveTranscription/FetchNotes',
    async( _,{rejectWithValue}) => {
        try {
            const response = await api.get('/live-transcription/notes/');
            console.log(response.data);
            return response.data
        } catch(err) {
            const errorMessage =
                err.response?.data?.error ||
                err.response?.data ||
                err.message ||
                'Save note failed';

            dispatch(showNotification({
                message: errorMessage,
                type: 'error',
            }));

            return rejectWithValue(errorMessage);
        }
    }
)

export const FetchDetailNote = createAsyncThunk(
    'liveTranscription/FetchDetailNote',
    async( id,{rejectWithValue}) => {
        try {
            const response = await api.get(`/live-transcription/notes/${id}/`);
            console.log(response.data);
            return response.data
        } catch(err) {
            const errorMessage =
                err.response?.data?.error ||
                err.response?.data ||
                err.message ||
                ' note failed';

            dispatch(showNotification({
                message: errorMessage,
                type: 'error',
            }));

            return rejectWithValue(errorMessage);
        }
    }
)


export const UpdateNote = createAsyncThunk(
    "liveTranscription/UpdateNote",
    async ({ id, title, transcript_text }, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.patch(
                `/live-transcription/notes-update/${id}/`,
                { title, transcript_text }
            );
            dispatch(showNotification({
                message: 'note updated',
                type: 'success',
            }));
            return response.data;
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                err.response?.data ||
                err.message ||
                ' note failed';

            dispatch(showNotification({
                message: errorMessage,
                type: 'error',
            }));

            return rejectWithValue(errorMessage);
        }
    }
);

