import { toast } from "sonner";
import { API } from "@/config/config";
import { useApiMutation } from "@/hooks/hook";

export const useDeleteUser = () => {
  const { mutateAsync: deleteUser } = useApiMutation(
    "DELETE",
    API.USER.DELETE_ME,
    {
      invalidateQueries: [["auth", "me"]],
      onSuccess: (data) => toast.success(data.message),
      onError: (err) => toast.error(err.response?.data.message),
    },
  );

  return {
    deleteUser,
  };
};
