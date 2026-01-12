import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { showNotification } from "./NotificationSlice";

export const FetchReviews = createAsyncThunk(
    'review/FetchReviews',
    async(_,{rejectWithValue}) => {
        try {
            const response = await api.get('/review/');
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "Fetch review failed")
        }
    }
)

export const UploadReview = createAsyncThunk(
    "review/UploadReview",
    async ({ rating, title, comment }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post("/review/", {
                rating,
                title,
                comment,
            });

            dispatch(
                showNotification({
                    message: "Review submitted successfully",
                    type: "success",
                })
            );

            return response.data;
        } catch (err) {
            const errorMessage =
                err.response?.data?.detail ||
                err.response?.data ||
                "Failed to submit review";

            dispatch(
                showNotification({
                    message: errorMessage,
                    type: "error",
                })
            );

            return rejectWithValue(errorMessage);
        }
    }
);

export const DeleteReviews = createAsyncThunk(
    'review/DeleteReviews',
    async( id ,{rejectWithValue}) => {
        try {
            const response = await api.delete(`/review/${id}/`);
            console.log(response.data);
            return response.data
        } catch(err) {
            console.log(err);
            return rejectWithValue(err.response?.data || "Delete review failed")
        }
    }
)
