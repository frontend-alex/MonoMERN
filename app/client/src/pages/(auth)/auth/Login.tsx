import AppLogo from "@/components/branding/logo";

import { useLogin } from "@/features/auth/hooks/use-login";

import { useAuthProviders } from "@/features/auth/hooks/use-auth-providers";

import { LoginForm } from "@/features/auth/forms/login/login-form-02";

const Login = () => {
  const { form, isPending, handleLogin } = useLogin();
  const { providers } = useAuthProviders();

  return (
    <div>
      <div className="hidden lg:flex p-5 absolute">
        <AppLogo />
      </div>
      <LoginForm
        form={form}
        handleSubmit={handleLogin}
        isPending={isPending}
        providers={providers}
      />
    </div>
  );
};

export default Login;
