import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"

const UserMiddleware = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full py-8">
                <div className="w-6 h-6 border-2 border-[var(--color-Line)] border-t-[var(--color-PrimaryColor)] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/authentication-required" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}

export default UserMiddleware;