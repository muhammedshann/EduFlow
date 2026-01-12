// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import api from "../../api/axios";
// import { showNotification } from "./NotificationSlice";

// export const AdminFetchReviews = createAsyncThunk(
//     'review/AdminFetchReviews',
//     async(_,{rejectWithValue}) => {
//         try {
//             const response = await api.get('/review/');
//             console.log(response.data);
//             return response.data
//         } catch(err) {
//             console.log(err);
//             return rejectWithValue(err.response?.data || "Fetch review failed")
//         }
//     }
// )

// export const AdminFetchReviews = createAsyncThunk(
//     'review/AdminFetchReviews',
//     async(_,{rejectWithValue}) => {
//         try {
//             const response = await api.get('/review/');
//             console.log(response.data);
//             return response.data
//         } catch(err) {
//             console.log(err);
//             return rejectWithValue(err.response?.data || "Fetch review failed")
//         }
//     }
// )


// /* FETCH */
// // export const AdminFetchReviews = createAsyncThunk(
// //     "admin/fetchReviews",
// //     async () => {
// //         const res = await api.get("/admin/reviews/");
// //         return res.data;
// //     }
// // );

// /* DELETE */
// export const AdminDeleteReview = createAsyncThunk(
//     "admin/deleteReview",
//     async (id) => {
//         await api.delete(`/admin/reviews/${id}/`);
//         return id;
//     }
// );
