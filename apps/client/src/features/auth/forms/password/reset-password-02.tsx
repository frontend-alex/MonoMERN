import { lazy, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoaderCircle } from "lucide-react";
import type { UpdatePasswordFormProps } from "@/features/auth/types/form-types";

const PasswordStrengthChecks = lazy(() => import("@/components/shared/auth/password-checker"))

export function UpdatePasswordForm({
  form,
  handleSubmit,
  isPending,
}: UpdatePasswordFormProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              handleSubmit?.(data)
            )}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Create your new password</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Enter your email below to recover to your account information
              </p>
            </div>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="New Password"
                        className="input no-ring"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("newPassword") && (
                <Suspense fallback={null}>
                  <PasswordStrengthChecks
                    password={form.watch("newPassword")}
                  />
                </Suspense>
              )}

              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel>Confirm Passowrd</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Re Enter Password"
                        className="input no-ring"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isPending} type="submit" className="w-full">
                {isPending ? (
                  <div className="flex items-center gap-3">
                    <LoaderCircle className="animate-spin" />
                    <p>Continuing...</p>
                  </div>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
