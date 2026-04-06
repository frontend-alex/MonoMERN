import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { LoaderCircle } from "lucide-react";
import type { RegisterFormProps } from "@/features/auth/types/form-types";
import { ProviderButtons } from "../buttons/provider-buttons";
import { config } from "@shared/config/config";

const PasswordStrengthChecks = lazy(
  () => import("@/components/shared/auth/password-checker")
);

export function RegisterForm({
  form,
  handleSubmit,
  providers,
  isPending,
}: RegisterFormProps) {
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
                      <h1 className="text-2xl font-bold">Create an account</h1>
                      <p className="text-muted-foreground text-balance">
                        Sign up for your {config.app.name} account
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="grid gap-3">
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              type="username"
                              placeholder="John Doe"
                              className="input no-ring"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="grid gap-3">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="m@example.com"
                              className="input no-ring"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="grid gap-3">
                          <Label htmlFor="password">Password</Label>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="input no-ring"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("password") ? (
                      <Suspense fallback={null}>
                        <PasswordStrengthChecks
                          password={form.watch("password")}
                        />
                      </Suspense>
                    ) : null}

                    <Button
                      disabled={isPending}
                      type="submit"
                      className="w-full"
                    >
                      {isPending ? (
                        <div className="flex items-center justify-center gap-2">
                          <LoaderCircle className="animate-spin" />
                          <p>Signing up...</p>
                        </div>
                      ) : (
                        "Sign Up"
                      )}
                    </Button>

                    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                      <span className="bg-card text-muted-foreground relative z-10 px-2">
                        Or continue with
                      </span>
                    </div>

                    {providers && (
                      <ProviderButtons
                        providers={providers}
                        isPending={isPending}
                      />
                    )}

                    <div className="text-center text-sm">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="underline underline-offset-4"
                      >
                        Log in
                      </Link>
                    </div>
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
