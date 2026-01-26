import { Navigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";

const AdminPublicRoute = ({ children }) => {
    const { user } = useUser();

    // If a user is logged in, check their role and redirect accordingly
    if (user) {
        if (user.is_superuser) {
            // 1. If Admin: Go to Admin Dashboard
            return <Navigate to="/admin/dashboard/" replace />;
        } else {
            // 2. If Normal User: Go to the Main App Homepage (or User Dashboard)
            // This prevents them from seeing the Admin Login page
            return <Navigate to="/" replace />;
        }
    }

    // 3. If Guest (No user): Allow access to Admin Login page
    return children;
};

export default AdminPublicRoute;