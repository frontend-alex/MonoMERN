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
import type { ForgotPasswordFormProps } from "@/features/auth/types/form-types";

export function ForgotPasswordForm({
  form,
  handleSubmit,
  isPending,
}: ForgotPasswordFormProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div
        className="flex flex-col gap-4 p-6 md:p-10"
      >
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  handleSubmit?.(data)
                )}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Recover your account</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Enter your email below to recover to your account
                    information
                  </p>
                </div>
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid gap-3">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            className="input no-ring"
                            placeholder="m@example.com"
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
                        <p>Sending an email...</p>
                      </div>
                    ) : (
                      "Send an email"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://ui.shadcn.com/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
