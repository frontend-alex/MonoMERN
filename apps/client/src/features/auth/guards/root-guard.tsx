import { Loading } from "@/components/feedback/loading";

import { ROUTES } from "@/config/routes";

import { useAuth } from "@/contexts/auth-context";

import { useLocation } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";

const RootGuard = () => {
    const location = useLocation();

    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <Loading />;

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.PUBLIC.LOGIN} state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default RootGuard;