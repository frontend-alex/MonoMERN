import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useApiMutation } from "@/hooks/hook";
import { Input } from "@/components/ui/input";
import type { User } from "@shared/types/user";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountProviders } from "@shared/types/user";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  updatePasswordSchema,
  type updatePasswordSchemaType,
} from "@shared/schemas/auth/auth.schema";
import { LoaderCircle } from "lucide-react";
import { lazy, Suspense } from "react";
import { API } from "@/config/config";

const PasswordStrengthChecks = lazy(
  () => import("@/components/PasswordChecker")
);

const ProfilePassword = ({ user }: { user: User }) => {
  if (user.provider != AccountProviders.Credentials) return null;

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
      }
    );

  const handleUpdatePassword = async (data: updatePasswordSchemaType) =>
    await updatePassword(data);

  return (
    <div className="space-y-8 max-w-3xl mt-5">
      <div className="grid grid-cols-3 gap-8 items-start">
        <div>
          <h3 className="font-medium">Pasword</h3>
          <p className="text-sm mt-1 text-stone-400">
            This will be your unique identifier.
          </p>
        </div>
        <Form {...updatePasswordsForm}>
          <form
            onSubmit={updatePasswordsForm.handleSubmit(handleUpdatePassword)}
            className="col-span-2 space-y-4"
          >
            <FormField
              control={updatePasswordsForm.control}
              name="password"
              render={({ field }) => (
                <FormItem className="grid gap-3">
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Current Password"
                      className="input no-ring"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updatePasswordsForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="grid gap-3">
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="New password"
                      className="input no-ring"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watch("newPassword") ? (
              <Suspense fallback={null}>
                <PasswordStrengthChecks password={watch("newPassword")} />
              </Suspense>
            ) : null}
            <FormField
              control={updatePasswordsForm.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem className="grid gap-3">
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm New password"
                      className="input no-ring"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <div className="flex items-center gap-3">
                  <LoaderCircle className="animate-spin" />
                  <p>Saving...</p>
                </div>
              ) : (
                "Save"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ProfilePassword;
