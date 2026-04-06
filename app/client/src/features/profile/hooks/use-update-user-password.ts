import { API } from "@/config/config";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updatePasswordSchema,
  type updatePasswordSchemaType,
} from "@shared/schemas/auth/auth.schema";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const useUpdateUserPass = () => {
  const updatePasswordsForm = useForm({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const { watch } = updatePasswordsForm;

  const { mutateAsync: updatePassword, isPending } =
    useApiMutation<updatePasswordSchemaType>(
      "PUT",
      API.AUTH.PRIVATE.UPDATE_PASSWORD,
      {
        onSuccess: (data) => {
          updatePasswordsForm.reset();
          toast.success(data.message);
        },
        onError: (err) => toast.error(err.response?.data.message),
      },
    );

  const handleUpdatePassword = async (data: updatePasswordSchemaType) =>
    await updatePassword(data);

  return {
    updatePasswordsForm,
    handleUpdatePassword,
    isPending,
    watch,
  };
};
