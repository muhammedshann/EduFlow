import { Navigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";

const AdminProtectedRoute = ({ children }) => {
    const { user } = useUser();
    // If no user → redirect to admin login

    if (!user) {
        return <Navigate to="/admin/login/" replace />;
    }
    console.log(user);

    // Only allow is_superuser === true
    if (!user.is_superuser) {
        return <Navigate to="/auth/" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
