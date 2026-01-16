import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { showNotification } from "../NotificationSlice";

export const SentNotification = createAsyncThunk(
    'notification/SentNotification',
    async ({ data, target_type }, { dispatch, rejectWithValue }) => {
        try {
            // We spread 'data' and add 'target_type' so the backend 
            // receives: { title, message, notification_type, target_type, username }
            const response = await api.post('/admin/notifications/', { 
                ...data, 
                target_type 
            });
            
            // // Show success notification
            // dispatch(showNotification({
            //     message: 'Notification sent successfully!',
            //     type: 'success',
            // }));

            return response.data;
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to send notification';

            dispatch(showNotification({
                message: errorMessage,
                type: 'error',
            }));

            return rejectWithValue(errorMessage);
        }
    }
);

// const [formData, setFormData] = useState({
//     title: '',
//     notification_type: 'system',
//     message: '',
//     username: ''
// });

// const payload = {
//     data: formData, 
//     target_type: targetType 
// };
// await dispatch(SentNotification(payload));