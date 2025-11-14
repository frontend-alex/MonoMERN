import AppLogo from "@/components/AppLogo";

import { toast } from "sonner";
import { useApiMutation } from "@/hooks/hook";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type resetPasswordSchemaType,
} from "@shared/schemas/auth/auth.schema";
import { ResetPasswordForm } from "@/components/auth/forms/password/reset-password-02";
import { API } from "@/config/config";

const ResetPassword = () => {
  const resetPasswordForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      confirmNewPassword: "",
      newPassword: "",
    },
  });

  const { mutateAsync: updatePassword, isPending } = useApiMutation(
    "PUT",
    API.AUTH.PRIVATE.UPDATE_PASSWORD,
    {
      onSuccess: (data) => {
        resetPasswordForm.reset();
        toast.success(data.message);
      },
      onError: (err) => toast.error(err.response?.data.message),
    }
  );

  const handleResetPassword = async (data: resetPasswordSchemaType) =>
    await updatePassword(data);

  return (
    <div>
      <div className="hidden lg:flex p-5 absolute">
        <AppLogo />
      </div>
      <ResetPasswordForm
        resetPasswordForm={resetPasswordForm}
        isPending={isPending}
        handleSubmit={handleResetPassword}
      />
    </div>
  );
};

export default ResetPassword;
