import z from "zod";
import AppLogo from "@/components/branding/logo";

import { toast } from "sonner";
import { useFormWithSchema } from "@/lib/utils";
import { useApiMutation } from "@/hooks/hook";
import { emailSchema } from "@shared/schemas/user/user.schema";
import { ForgotPasswordForm } from "@/features/auth/forms/password/forgot-password-02";
import { API } from "@/config/config";

const ForgotPassword = () => {
  const emailSchemaObject = z.object({ email: emailSchema });

  const forgotPasswordForm = useFormWithSchema(emailSchemaObject, {
    email: "",
  });

  const { mutateAsync: forgotPassword, isPending } = useApiMutation(
    "POST",
    API.AUTH.PUBLIC.FORGOT_PASSWORD,
    {
      onSuccess: (data) => toast.success(data.message),
      onError: (err) => toast.error(err.response?.data.message),
    }
  );

  const handleForgotPassword = async (data: { email: string }) =>
    await forgotPassword(data);

  return (
    <div>
      <div className="hidden lg:flex p-5 absolute">
        <AppLogo />
      </div>
      <ForgotPasswordForm
        form={forgotPasswordForm}
        isPending={isPending}
        handleSubmit={handleForgotPassword}
      />
    </div>
  );
};

export default ForgotPassword;
