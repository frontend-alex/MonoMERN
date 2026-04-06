import AppLogo from "@/components/branding/logo";

import { useRegister } from "@/features/auth/hooks/use-register";
import { RegisterForm } from "@/features/auth/forms/register/register-form-03";

const Register = () => {
  const { form, handleRegister, isPending, providerRes } = useRegister();

  return (
    <div>
      <div className="hidden lg:flex p-5 absolute">
        <AppLogo />
      </div>
      <RegisterForm
        form={form}
        handleSubmit={handleRegister}
        isPending={isPending}
        providers={providerRes?.data?.publicProviders ?? []}
      />
    </div>
  );
};

export default Register;
