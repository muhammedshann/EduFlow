import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { showNotification } from "./NotificationSlice";

export const StartLiveTranscription = createAsyncThunk(
    'liveTranscription/StartLiveTranscription',
    async( _,{dispatch,rejectWithValue}) => {
        try {
            const response = await api.post('/transcription-notes/start/');
            console.log(response.data);
            return response.data
        } catch(err) {
            const errorMessage =
                err.response?.data?.error ||
                err.response?.data ||
                err.message ||
                'starting note failed';

            dispatch(showNotification({
                message: errorMessage,
                type: 'error',
            }));

            return rejectWithValue(errorMessage);
        }
    }
)

export const SaveLiveNote = createAsyncThunk(
    'liveTranscription/SaveLiveNote',
    async( note,{dispatch,rejectWithValue}) => {
        try {
            const response = await api.post('/transcription-notes/', note);
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
    async( _,{dispatch, rejectWithValue}) => {
        try {
            const response = await api.get('/transcription-notes/notes/');
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
    async( id,{dispatch, rejectWithValue}) => {
        try {
            const response = await api.get(`/transcription-notes/notes/${id}/`);
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
                `/transcription-notes/notes-update/${id}/`,
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

export const DeleteNote = createAsyncThunk(
    'liveTranscription/DeleteNote',
    async( id,{dispatch, rejectWithValue}) => {
        try {
            const response = await api.delete(
                '/transcription-notes/notes/',
                {
                    data: { id }   // ✅ THIS IS THE FIX
                }
            );
            console.log(response.data);
            dispatch(showNotification({
                message: 'note deleted succesfully',
                type: 'success',
            }));
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


export const UploadTranscription = createAsyncThunk(
    "liveTranscription/UploadTranscription",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await api.post(
                '/transcription-notes/upload/',
                data
            );
            dispatch(showNotification({
                message: 'uploaded please wait...',
                type: 'success',
            }));
            return response.data;
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                err.response?.data ||
                err.message ||
                ' upload failed';

            dispatch(showNotification({
                message: errorMessage,
                type: 'error',
            }));

            return rejectWithValue(errorMessage);
        }
    }
);
