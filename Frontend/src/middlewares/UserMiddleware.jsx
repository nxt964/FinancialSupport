import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"

const UserMiddleware = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated()) {
        return <Navigate to="/authentication-required" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}

export default UserMiddleware;