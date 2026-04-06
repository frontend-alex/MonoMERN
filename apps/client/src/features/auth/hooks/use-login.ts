import { useApiMutation } from "@/hooks/use-api-mutation";
import { API } from "@/config/config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  type LoginSchemaType,
} from "@shared/schemas/auth/auth.schema";

export const useLogin = () => {
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
          error?.userMessage || error?.message || "Something went wrong",
        );
      },
    },
  );

  const handleLogin = (data: LoginSchemaType) => login(data);

  return {
    form,
    isPending,
    handleLogin,
  };
};
