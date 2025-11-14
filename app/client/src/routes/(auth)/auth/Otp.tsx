import { useEffect, useState } from "react";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { API } from "@/config/config";
import { ROUTES } from "@/config/routes";
import AppLogo from "@/components/AppLogo";
import { useApiMutation } from "@/hooks/hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { OtpForm } from "@/components/auth/forms/otp/otp-form-02";
import { otpSchema, type OtpSchemaType } from "@shared/schemas/auth/auth.schema";

const COOLDOWN_DURATION = 60;
const STORAGE_KEY = "otp_last_sent_at";

const Otp = () => {
  const navigate = useNavigate();
  const email = new URLSearchParams(location.search).get("email") ?? "";
  const [cooldown, setCooldown] = useState(0);

  const otpForm = useForm<OtpSchemaType>({
    resolver: zodResolver(otpSchema),
    defaultValues: { pin: "", email },
  });

  const { mutateAsync: sendOtp, isPending: isOtpPending } = useApiMutation(
    "POST",
    API.AUTH.PUBLIC.SEND_OTP,
    {
      onSuccess: (data) => toast.success(data.message),
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to send OTP");
      },
    }
  );

  const { mutateAsync: verifyEmail, isPending: isOtpverifying } = useApiMutation(
    "PUT",
    API.AUTH.PUBLIC.VALIDATE_OTP,
    {
      onSuccess: () => navigate(ROUTES.PUBLIC.LOGIN),
      onError: (err) => {
        toast.error(err.response?.data?.message || "Invalid OTP");
      },
    }
  );

  const handleSubmit = (data: OtpSchemaType) => {
    verifyEmail(data);
  };

  const resendOtp = async () => {
    if (cooldown > 0) return;

    await sendOtp({ email });
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, now.toString());
    setCooldown(COOLDOWN_DURATION);
  };

  // On mount: check if cooldown should resume from localStorage
  useEffect(() => {
    const lastSent = localStorage.getItem(STORAGE_KEY);
    if (lastSent) {
      const secondsPassed = Math.floor((Date.now() - Number(lastSent)) / 1000);
      const remaining = COOLDOWN_DURATION - secondsPassed;
      if (remaining > 0) setCooldown(remaining);
    }
  }, []);

  // Cooldown countdown interval
  useEffect(() => {
    if (cooldown === 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  return (
    <div>
      <div className="hidden lg:flex p-5 absolute">
        <AppLogo />
      </div>
      <OtpForm
        cooldown={cooldown}
        otpForm={otpForm}
        isOtpverifying={isOtpverifying}
        isOtpPending={isOtpPending}
        resendOtp={resendOtp}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default Otp;
