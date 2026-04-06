import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { API } from "@/config/config";
import { ROUTES } from "@/config/routes";
import { useApiMutation } from "@/hooks/use-api-mutation";
import {
  otpSchema,
  type OtpSchemaType,
} from "@shared/schemas/auth/auth.schema";

const COOLDOWN_DURATION = 60;

const getStorageKey = (email: string) => `otp_last_sent_at:${email}`;

const getRemainingCooldown = (lastSentAt: number, duration: number) => {
  const secondsPassed = Math.floor((Date.now() - lastSentAt) / 1000);
  return Math.max(duration - secondsPassed, 0);
};

export const useOtp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";
  const storageKey = useMemo(() => getStorageKey(email), [email]);

  const [cooldown, setCooldown] = useState(0);

  const form = useForm<OtpSchemaType>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      pin: "",
      email,
    },
  });

  const { reset } = form;

  useEffect(() => {
    reset({
      pin: "",
      email,
    });
  }, [email, reset]);

  const { mutateAsync: sendOtp, isPending: isOtpPending } = useApiMutation(
    "POST",
    API.AUTH.PUBLIC.SEND_OTP,
    {
      onSuccess: (data) => toast.success(data.message),
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to send OTP");
      },
    },
  );

  const { mutateAsync: verifyEmail, isPending: isOtpVerifying } =
    useApiMutation("PUT", API.AUTH.PUBLIC.VALIDATE_OTP, {
      onSuccess: () => navigate(ROUTES.PUBLIC.LOGIN),
      onError: (err) => {
        toast.error(err.response?.data?.message || "Invalid OTP");
      },
    });

  const handleSubmit = useCallback(
    async (data: OtpSchemaType) => {
      await verifyEmail(data);
    },
    [verifyEmail],
  );

  const resendOtp = useCallback(async () => {
    if (!email || cooldown > 0) return;

    await sendOtp({ email });

    const now = Date.now();
    localStorage.setItem(storageKey, String(now));
    setCooldown(COOLDOWN_DURATION);
  }, [email, cooldown, sendOtp, storageKey]);

  useEffect(() => {
    if (!email) return;

    const lastSent = localStorage.getItem(storageKey);
    if (!lastSent) return;

    setCooldown(getRemainingCooldown(Number(lastSent), COOLDOWN_DURATION));
  }, [email, storageKey]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timeout = setTimeout(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [cooldown]);

  return {
    form,
    email,
    cooldown,
    isOtpPending,
    isOtpVerifying,
    handleSubmit,
    resendOtp,
  };
};
