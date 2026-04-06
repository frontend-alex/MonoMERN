import { toast } from "sonner";

import { useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { API } from "@/config/config";

import { ROUTES } from "@/config/routes";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { useApiQuery } from "@/hooks/use-api-mutation";

import type { Providers } from "@/features/auth/forms/buttons/provider-buttons";
import {
  registrationSchema,
  type RegistrationSchemaType,
} from "@shared/schemas/auth/auth.schema";

export const useRegister = () => {
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
        error?.userMessage || error?.message || "Something went wrong",
      );
    },
  });

  const { data: providerRes } = useApiQuery<{
    publicProviders: Providers[];
  }>(["providers"], API.AUTH.PUBLIC.PROVIDERS);

  const handleRegister = (data: RegistrationSchemaType) => register(data);

  return { register, isPending, form, handleRegister, providerRes };
};
