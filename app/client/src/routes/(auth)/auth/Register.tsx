import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import AppLogo from "@/components/AppLogo";
import { RegisterForm } from "@/components/auth/forms/register/register-form-03";
import { useApiMutation, useApiQuery } from "@/hooks/hook";
import {
  registrationSchema,
  type RegistrationSchemaType,
} from "@shared/schemas/auth/auth.schema";
import type { Providers } from "@/components/auth/forms/buttons/provider-buttons";
import { API } from "@/config/config";
import { ROUTES } from "@/config/routes";

const Register = () => {
  const navigate = useNavigate();

  const form = useForm<RegistrationSchemaType>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const { mutateAsync: sendOtp } = useApiMutation("POST", "/auth/send-otp", {
    onSuccess: (data) => toast.success(data.message),
    onError: (err) => toast.success(err.message),
  });

  const { mutateAsync: register, isPending } = useApiMutation<
    { email: string },
    RegistrationSchemaType
  >("POST", API.AUTH.PUBLIC.REGISTER, {
    onSuccess: ({ data, message }) => {
      const email = data?.email;
      if (email) {
        toast.success(message);
        sendOtp({ email });
        navigate(`${ROUTES.PUBLIC.VERIFY_EMAIL}?email=${email}`);
      }
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
  });

  const { data: providerRes } = useApiQuery<{
    publicProviders: Providers[];
  }>(["providers"], API.AUTH.PUBLIC.PROVIDERS);

  const handleRegister = (data: RegistrationSchemaType) => register(data);

  return (
    <div>
      <div className="hidden lg:flex p-5 absolute">
        <AppLogo />
      </div>
      <RegisterForm
        registerForm={form}
        handleSubmit={handleRegister}
        isPending={isPending}
        providers={providerRes?.data?.publicProviders ?? []}
      />
    </div>
  );
};

export default Register;
