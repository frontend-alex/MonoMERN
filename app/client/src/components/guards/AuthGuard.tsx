import { Loading } from "@/components/Loading";
import { ROUTES } from "@/config/routes";

import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const AuthGuard = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <Loading />;

  if (isAuthenticated) {
    return <Navigate to={ROUTES.BASE.APP} />;
  }

  return <Outlet />;
};

export default AuthGuard;


