import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { API } from "@/config/config";
import { ROUTES } from "@/config/routes";
import AppLogo from "@/components/AppLogo";
import { useAuth } from "@/contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiMutation, useApiQuery } from "@/hooks/hook";
import { LoginForm } from "@/components/auth/forms/login/login-form-02";
import type { Providers } from "@/components/auth/forms/buttons/provider-buttons";
import { loginSchema, type LoginSchemaType } from "@shared/schemas/auth/auth.schema";

const Login = () => {
  const navigate = useNavigate();
  const { refetch } = useAuth();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: login, isPending } = useApiMutation<LoginSchemaType>(
    "POST",
    API.AUTH.PUBLIC.LOGIN,
    {
      onSuccess: () => {
        refetch();
        navigate(ROUTES.BASE.APP);
      },
      onError: (err) => {
        const error = err.response?.data;
        if (error?.otpRedirect && error?.email) {
          navigate(`${ROUTES.PUBLIC.VERIFY_EMAIL}?email=${error.email}`);
          return;
        }
        toast.error(
          error?.userMessage || error?.message || "Something went wrong"
        );
      },
    }
  );

  const { data: providersRes } = useApiQuery<{
    publicProviders: Providers[];
  }>(["providers"], API.AUTH.PUBLIC.PROVIDERS);

  const handleLogin = (data: LoginSchemaType) => login(data);

  return (
    <div>
      <div className="hidden lg:flex p-5 absolute">
        <AppLogo />
      </div>
      <LoginForm
        loginForm={form}
        handleSubmit={handleLogin}
        isPending={isPending}
        providers={providersRes?.data?.publicProviders ?? []}
      />
    </div>
  );
};

export default Login;
