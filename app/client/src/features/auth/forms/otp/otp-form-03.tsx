import { Loader, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OtpFormProps } from "@/features/auth/types/form-types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function OtpForm({
  form,
  isPending,
  isOtpVerifying,
  cooldown,
  handleSubmit,
  resendOtp,
}: OtpFormProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => handleSubmit?.(data))}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Verify your email</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Enter the 6-digit code we sent to your email.
                  </p>
                </div>
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-Time Password</FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field} className="w-full">
                            <div className="flex w-full justify-between">
                              <InputOTPGroup className="flex w-full justify-between">
                                {[0, 1, 2].map((index) => (
                                  <InputOTPSlot
                                    key={index}
                                    index={index}
                                    className="flex-1 h-13"
                                  />
                                ))}
                              </InputOTPGroup>

                              <InputOTPSeparator className="mt-3 mx-2" />

                              <InputOTPGroup className="flex w-full justify-between">
                                {[3, 4, 5].map((index) => (
                                  <InputOTPSlot
                                    key={index}
                                    index={index}
                                    className="flex-1 h-13"
                                  />
                                ))}
                              </InputOTPGroup>
                            </div>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    disabled={isPending || isOtpVerifying}
                    type="submit"
                    className="w-full"
                  >
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <LoaderCircle className="animate-spin" />
                        <span>Verifying email...</span>
                      </div>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>

                <div className="text-center text-sm">
                  Haven't received the code?{" "}
                  {cooldown && cooldown > 0 ? (
                    <span className="text-muted-foreground">{`Wait ${cooldown}s`}</span>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending}
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
