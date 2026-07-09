import AppLogo from "@/components/branding/logo";

import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type resetPasswordSchemaType,
} from "shared/schemas/auth/auth.schema";
import { UpdatePasswordForm } from "@/features/auth/forms/password/reset-password-02";
import { API } from "@/config/config";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {

  const navigate = useNavigate();

  const updatePasswordForm = useForm<resetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
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
        navigate("/auth/login");
      },
      onError: (err) => toast.error(err.response?.data.message),
    }
  );

  const handleUpdatePassword = async (data: resetPasswordSchemaType) =>
    await updatePassword(data);

  return (
    <>
      <div className="hidden lg:flex p-5 absolute">
        <AppLogo />
      </div>
      <UpdatePasswordForm
        form={updatePasswordForm}
        isPending={isPending}
        handleSubmit={handleUpdatePassword}
      />
    </>
  );
};

export default ResetPassword;
