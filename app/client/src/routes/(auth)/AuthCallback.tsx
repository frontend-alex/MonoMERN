import { useEffect } from "react";
import { useApiMutation } from "@/hooks/hook";
import { useNavigate } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { API } from "@/config/config";
import { ROUTES } from "@/config/routes";

const AuthCallback = () => {
  const navigate = useNavigate();
  const queryClient = new QueryClient();

  const { mutateAsync: login } = useApiMutation("POST", API.AUTH.PUBLIC.LOGIN);

  useEffect(() => {
    const handleAuth = async () => {
      const token = new URLSearchParams(window.location.search).get("token");

      if (!token) {
        navigate(ROUTES.PUBLIC.LOGIN);
        return;
      }

      try {
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      } catch (error) {
        navigate(ROUTES.PUBLIC.LOGIN);
      }
    };

    handleAuth();
  }, [login, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Logging you in...</p>
    </div>
  );
};

export default AuthCallback;
