import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ResetPasswordFormProps } from "@/features/auth/types/form-types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { config } from "@shared/config/config";


const PasswordStrengthChecks = lazy(() => import("@/components/shared/auth/password-checker"))

export function ResetPasswordForm({
  form,
  handleSubmit,
  isPending,
}: ResetPasswordFormProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) =>
                    handleSubmit?.(data)
                  )}
                  className="p-6 md:p-8"
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold">
                        Create your new password
                      </h1>
                      <p className="text-muted-foreground text-balance">
                        Recover to your {config.app.name} account
                      </p>
                    </div>

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

                    <Button
                      disabled={isPending}
                      type="submit"
                      className="w-full"
                    >
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

              <div className="relative hidden md:block">
                <img
                  src="https://ui.shadcn.com/placeholder.svg"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>

          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our{" "}
            <Link to="#">Terms of Service</Link> and{" "}
            <Link to="#">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
