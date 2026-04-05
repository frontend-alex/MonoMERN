import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/config/routes";

const AuthCallback = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleAuth = async () => {
      const token = new URLSearchParams(window.location.search).get("token");

      if (!token) {
        navigate(ROUTES.PUBLIC.LOGIN);
        return;
      }

      try {
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      } catch {
        navigate(ROUTES.PUBLIC.LOGIN);
      }
    };

    handleAuth();
  }, [navigate, queryClient]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Logging you in...</p>
    </div>
  );
};

export default AuthCallback;
