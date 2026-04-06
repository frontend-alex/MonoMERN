import { lazy, Suspense } from "react";

import { Link } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import { ROUTES } from "@/config/routes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { RegisterFormProps } from "@/features/auth/types/form-types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { ProviderButtons } from "../buttons/provider-buttons";

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
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full flex flex-col gap-6 max-w-sm">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => handleSubmit?.(data))}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Create an account</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Enter your email below to create your new account
              </p>
            </div>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        type="username"
                        placeholder="John Doe"
                        {...field}
                        className="input no-ring"
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
                        {...field}
                        className="input no-ring"
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

              <Button disabled={isPending} type="submit" className="w-full">
                {isPending ? (
                  <div className="flex items-center gap-3">
                    <LoaderCircle className="animate-spin" />
                    <p>Creating an account...</p>
                  </div>
                ) : (
                  "Create an account"
                )}
              </Button>
            </div>
          </form>
        </Form>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        {providers && (
          <ProviderButtons providers={providers} isPending={isPending} />
        )}
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            to={ROUTES.PUBLIC.LOGIN}
            className="underline underline-offset-4"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
