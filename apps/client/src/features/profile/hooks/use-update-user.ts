import { toast } from "sonner";
import { API } from "@/config/config";
import { useApiMutation } from "@/hooks/use-api-mutation";

export const useUpdateUser = () => {
  const { mutateAsync: update, isPending } = useApiMutation(
    "PUT",
    API.USER.UPDATE_ME,
    {
      invalidateQueries: [["auth", "me"]],
      onSuccess: (data) => toast.success(data.message),
      onError: (err) => toast.error(err.message),
    },
  );

  return {
    update,
    isPending,
  };
};
