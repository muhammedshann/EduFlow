import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "./AuthSlice"
import UserReducer from "./UserSlice"
import NotificationReducer from "./NotificationSlice"
import WalletReducer from "./WalletSlice"

export const Store = configureStore({
    reducer:{
        auth: AuthReducer,
        user: UserReducer,
        notification: NotificationReducer,
        wallet: WalletReducer
    }
})