import { OtpType } from "shared/types/otp";
import { config } from "shared/config/config";

import { createError } from "@/shared/errors/error";
import { EmailService } from "@/ports/email.port";
import { OtpRepository } from "./otp.repository.port";

type OtpServiceDeps = {
  otpRepository: OtpRepository;
  emailService: EmailService;
  getEmailTemplate: (templateName: string) => string;
};

export function createOtpService({
  otpRepository,
  emailService,
  getEmailTemplate,
}: OtpServiceDeps) {

  const sendOtp = async (
    userId: string,
    email: string,
    type: OtpType = OtpType.EmailVerification,
    
  ) => {
    try {
      const otp = await otpRepository.createOtp(userId, type, 5);

      const otpEmail = getEmailTemplate("otp");
      const html = otpEmail
        .replace("{{OTP_CODE}}", otp.code)
        .replace("{{YEAR}}", new Date().getFullYear().toString())
        .replace("{{APP_NAME}}", config.app.name);

      await emailService.sendEmail(email, "Your OTP code", html);
    } catch {
      throw createError("OTP_SEND_FAILED");
    }
  };

  const verifyOtp = async (
    userId: string,
    code: string,
    type: OtpType = OtpType.EmailVerification,
  ) => {
    const otp = await otpRepository.findByCodeAndType(code, type);

    if (!otp) {
      throw createError("OTP_NOT_FOUND");
    }

    if (otp.userId.toString() !== userId) {
      throw createError("INVALID_OTP");
    }

    if (otp.isExpired()) {
      throw createError("OTP_EXPIRED");
    }

    if (otp.isUsed) {
      throw createError("OTP_ALREADY_USED");
    }

    await otpRepository.markAsUsed(otp.id);
  };

  const resendOtp = async (
    userId: string,
    email: string,
    type: OtpType = OtpType.EmailVerification,
  ) => {
    await otpRepository.invalidateUserOtps(userId, type);

    return await sendOtp(userId, email, type);
  };

  return { sendOtp, verifyOtp, resendOtp };
}

export type OtpServiceType = ReturnType<typeof createOtpService>;
