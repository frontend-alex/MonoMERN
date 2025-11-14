import bcrypt from "bcrypt";

import { env } from "@/config/env";
import { OtpType } from "@shared/types/otp";
import { config } from "@shared/config/config";
import { createError } from "@/core/error/errors";
import { DecodedUser } from "@/api/middlewares/auth";
import { AccountProviders } from "@shared/types/user";
import { EmailUtils } from "@/infrastructure/email/email";
import { jwtUtils } from "@/infrastructure/email/auth/jwt/jwt";
import { UserRepo } from "@/core/repositories/user/user.repository";
import { AuthRepo } from "@/core/repositories/auth/auth.repository";
import { sendOtp as sendOtpService, verifyOtp } from "@/core/services/auth/otp.service";

const login = async (email: string, password: string) => {
  try {
    const user = await UserRepo.findByEmail(email);
    if (!user) throw createError("INVALID_CREDENTIALS");

    if (user.provider != AccountProviders.Credentials)
      throw createError("INVALID_CREDENTIALS");

    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw createError("INVALID_CREDENTIALS");

    if (!user.emailVerified) throw createError("EMAIL_NOT_VERIFIED", { extra: { otpRedirect: true, email } });

    return jwtUtils.generateToken(user.id, user.username);
  } catch (err) {
    throw err;
  }
};

const handleAuthCallback = async (user: DecodedUser) => {
  if (!user) throw createError("USER_NOT_FOUND");
  return jwtUtils.generateToken(user.id, user.username);
};


const register = async (username: string, email: string, password: string) => {
  try {
    const existingUserEmail = await UserRepo.findByEmail(email);
    if (existingUserEmail) {
      if (!existingUserEmail.emailVerified) {
        throw createError("EMAIL_ALREADY_TAKEN", {
          extra: { otpRedirect: true, email },
        });
      }

      throw createError("EMAIL_ALREADY_TAKEN");
    }

    const existingUserUsername = await UserRepo.findByUsername(username);
    if (existingUserUsername) throw createError("USERNAME_ALREADY_TAKEN");

    return await AuthRepo.createUser(username, email, password);
  } catch (err) {
    throw err;
  }
};

const sendOtp = async (email: string) => {
  try {
    const user = await UserRepo.findByEmail(email);

    if (!user) throw createError("USER_NOT_FOUND");
    if (user.emailVerified) throw createError("EMAIL_ALREADY_VERIFIED");

    return await sendOtpService(user.id, email, OtpType.EmailVerification);
  } catch (err) {
    throw err;
  }
};

const validateOtp = async (email: string, otp: string) => {
  try {
    const user = await UserRepo.findByEmail(email);
    if (!user) throw createError("USER_NOT_FOUND");

    // Verify OTP using the new service
    await verifyOtp(user.id, otp, OtpType.EmailVerification);

    // Mark user as email verified
    await UserRepo.safeUpdate({ email }, { emailVerified: true });
  } catch (err) {
    throw err;
  }
};

const updatePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  try {
    const user = await UserRepo.findById(userId);
    if (!user) throw createError("USER_NOT_FOUND");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw createError("INVALID_CURRENT_PASSWORD");

    if (currentPassword === newPassword) throw createError("SAME_PASSWORD");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserRepo.safeUpdate({ id: user.id }, { password: hashedPassword });
  } catch (err) {
    throw err;
  }
};

const sendPasswordEmail = async (email: string) => {
  try {
    const user = await UserRepo.findByEmail(email);
    if (!user) throw createError("USER_NOT_FOUND");

    if (user.provider !== AccountProviders.Credentials)
      throw createError("ACCOUNT_ALREADY_CONNECTED_WITH_PROVIDER");

    const token = jwtUtils.generateToken(user.id, user.username);

    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // one hour

    await UserRepo.safeUpdate(
      { _id: user.id },
      { tokenExpiry, resetToken: token }
    );

    const resetLink = `${env.CORS_ORIGINS}/reset-password`;

    const emailTemplate = EmailUtils.getEmailTemplate("reset-password");

    const html = emailTemplate
      .replace("{{RESET_LINK}}", resetLink)
      .replace("{{APP_NAME}}", config.app.name)
      .replace("{{YEAR}}", new Date().getFullYear().toString());

    await EmailUtils.sendEmail(email, "Reset Password Link", html);

    return { token };
  } catch (err) {
    throw err;
  }
};

const resetPassword = async (userId: string, newPassword: string) => {
  try {
    const user = await UserRepo.findById(userId);
    if (!user) throw createError("USER_NOT_FOUND");

    if (newPassword === user.password) throw createError("SAME_PASSWORD");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserRepo.safeUpdate(
      { _id: user.id },
      { password: hashedPassword, $unset: { resetToken: 1, tokenExpiry: 1 } }
    );
  } catch (err) {
    throw err;
  }
};

export const AuthService = {
  login,
  sendOtp,
  register,
  validateOtp,
  resetPassword,
  updatePassword,
  sendPasswordEmail,
  handleAuthCallback,
};
