import type { User } from "@shared/types/user";
import type { ApiError } from "@shared/types/api";

import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation, useApiQuery } from "@/hooks/hook";
import { createContext, useCallback, useContext, useMemo } from "react";
import { API } from "@/config/config";
import { ROUTES } from "@/config/routes";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: ApiError | null;
  isAuthenticated: boolean;
  logout: () => void;
  refetch: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useApiQuery<{ user: User }>(
    ["auth", "me"],
    API.USER.GET_ME,
    { staleTime: 1000 * 60 * 5 }
  );

  const { mutateAsync: logoutMutation } = useApiMutation(
    "POST",
    API.AUTH.PRIVATE.LOGOUT,
    {
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.setQueryData(["auth", "me"], null);
        navigate(ROUTES.PUBLIC.LANDING, { replace: true });
      },
    }
  );

  const logout = useCallback(() => {
    logoutMutation(undefined);
  }, [logoutMutation]);

  const value = useMemo<AuthContextType>(
    () => ({
      user: data?.data?.user ?? null,
      isLoading,
      error,
      isAuthenticated: Boolean(data?.data?.user) && !error,
      logout,
      refetch,
    }),
    [data, isLoading, error, refetch, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
};
