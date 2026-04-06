import { Loader, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
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

import type { OtpFormProps } from "@/features/auth/types/form-types";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function OtpForm({
  form,
  cooldown,
  isPending,
  isOtpVerifying,
  handleSubmit,
  resendOtp,
}: OtpFormProps) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
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
                    <div className="flex flex-col text-left">
                      <h1 className="text-2xl font-bold">Verify your email</h1>
                      <p className="text-muted-foreground text-sm">
                        Enter the 6-digit code we sent to your email.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="pin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>One-Time Password</FormLabel>
                          <FormControl>
                            <InputOTP
                              maxLength={6}
                              {...field}
                              className="w-full"
                            >
                              <InputOTPGroup className="w-full justify-between flex">
                                {Array.from({ length: 6 }).map((_, index) => (
                                  <InputOTPSlot
                                    key={index}
                                    index={index}
                                    className="flex-1 h-13"
                                  />
                                ))}
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      disabled={isOtpVerifying}
                      type="submit"
                      className="w-full"
                    >
                      {isOtpVerifying ? (
                        <div className="flex items-center gap-2">
                          <LoaderCircle className="animate-spin" />
                          <span>Verifying email...</span>
                        </div>
                      ) : (
                        "Verify"
                      )}
                    </Button>

                    <div className="text-center text-sm">
                      Haven't received the code?{" "}
                      {cooldown && cooldown > 0 ? (
                        <span className="text-muted-foreground">{`Wait ${cooldown}s`}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={resendOtp}
                          className="text-primary underline underline-offset-4 hover:text-primary/80 disabled:text-stone-400 disabled:cursor-none cursor-pointer"
                        >
                          {isPending ? (
                            <div className="flex items-center gap-3">
                              <Loader
                                size={10}
                                className="text-stone-400 animate-spin"
                              />{" "}
                              Sending{" "}
                            </div>
                          ) : (
                            "Send Again"
                          )}
                        </button>
                      )}
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
