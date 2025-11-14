import { OtpType } from "@shared/types/otp";
import { config } from "@shared/config/config";
import { 
  createOtp, 
  findByCodeAndType, 
  markAsUsed, 
  invalidateUserOtps, 
} from "@/core/repositories/auth/otp.repository";
import { createError } from "@/core/error/errors";
import { EmailUtils } from "@/infrastructure/email/email";


export const sendOtp = async (userId: string, email: string, type: OtpType = OtpType.EmailVerification) => {
  try {
    const otp = await createOtp(userId, type, 5); // 5 minutes expiry
    
    // Send email
    const otpEmail = EmailUtils.getEmailTemplate("otp");
    const html = otpEmail
      .replace("{{OTP_CODE}}", otp.code)
      .replace("{{YEAR}}", new Date().getFullYear().toString())
      .replace("{{APP_NAME}}", config.app.name);
    
    await EmailUtils.sendEmail(email, "Your OTP code", html);
    
  } catch (error) {
    throw createError("OTP_SEND_FAILED");
  }
};

export const verifyOtp = async (userId: string, code: string, type: OtpType = OtpType.EmailVerification) => {
  try {
    const otp = await findByCodeAndType(code, type);
    
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
    
    // Mark OTP as used
    await markAsUsed(otp.id);
    
  } catch (error) {
    throw error;
  }
};

export const resendOtp = async (userId: string, email: string, type: OtpType = OtpType.EmailVerification) => {
  try {
    // Invalidate existing OTPs
    await invalidateUserOtps(userId, type);
    
    // Send new OTP
    return await sendOtp(userId, email, type);

  } catch (error) {
    throw error;
  }
};
