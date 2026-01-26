// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";

const ProtectedRoute = ({ children, isLogin = false }) => {
    const { user } = useUser();

    if (!user && !isLogin) {
        // ✅ Redirect to login if not authenticated
        return <Navigate to="/auth/" replace />;
    }
    if (isLogin && user) {
        return <Navigate to="/dashboard/" replace />;
    }

    return children;
};

export default ProtectedRoute;