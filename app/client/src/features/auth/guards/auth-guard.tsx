import { Loading } from "@/components/feedback/loading";
import { ROUTES } from "@/config/routes";

import { useAuth } from "@/contexts/auth-context";
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


