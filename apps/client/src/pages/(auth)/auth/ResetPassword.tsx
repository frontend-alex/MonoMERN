import AppLogo from "@/components/branding/logo";

import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updatePasswordSchema,
  type updatePasswordSchemaType,
} from "@shared/schemas/auth/auth.schema";
import { UpdatePasswordForm } from "@/features/auth/forms/password/reset-password-02";
import { API } from "@/config/config";

const ResetPassword = () => {
  const updatePasswordForm = useForm({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const { mutateAsync: updatePassword, isPending } = useApiMutation(
    "PUT",
    API.AUTH.PRIVATE.UPDATE_PASSWORD,
    {
      onSuccess: (data) => {
        updatePasswordForm.reset();
        toast.success(data.message);
      },
      onError: (err) => toast.error(err.response?.data.message),
    }
  );

  const handleUpdatePassword = async (data: updatePasswordSchemaType) =>
    await updatePassword(data);

  return (
    <div>
      <div className="hidden lg:flex p-5 absolute">
        <AppLogo />
      </div>
      <UpdatePasswordForm
        form={updatePasswordForm}
        isPending={isPending}
        handleSubmit={handleUpdatePassword}
      />
    </div>
  );
};

export default ResetPassword;
