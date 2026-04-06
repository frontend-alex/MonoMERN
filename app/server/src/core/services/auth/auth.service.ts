import bcrypt from "bcrypt";

import { env } from "@/config/env";
import { OtpType } from "@shared/types/otp";
import { config } from "@shared/config/config";
import { createError } from "@/core/error/errors";
import { DecodedUser } from "@/api/middlewares/auth";
import { AccountProviders, User } from "@shared/types/user";
import { EmailUtils } from "@/infrastructure/email/email";
import { jwtUtils } from "@/infrastructure/auth/jwt/jwt";
import { IUserRepo } from "@/infrastructure/interfaces/user/user.interface";
import { OtpServiceType } from "@/core/services/auth/otp.service";
import { UserMapper } from "@/core/mappers/UserMapper";

export const createAuthService = (UserRepo: IUserRepo, otpService: OtpServiceType) => {
  const login = async (
  email: string,
  password: string,
): Promise<{
  user: User;
  accessToken: string;
  refreshToken: string;
}> => {
  try {
    const user = await UserRepo.findByEmailWithPassword(email);
    if (!user) throw createError("INVALID_CREDENTIALS");

    if (user.provider != AccountProviders.Credentials)
      throw createError("INVALID_CREDENTIALS");

    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw createError("INVALID_CREDENTIALS");

    if (!user.emailVerified)
      throw createError("EMAIL_NOT_VERIFIED", {
        extra: { otpRedirect: true, email },
      });

    const accessToken = jwtUtils.generateToken(user.id, user.username);
    const refreshToken = jwtUtils.generateRefreshToken(user.id, user.username);

    return { 
      user: UserMapper.toUserDTO(user), 
      accessToken, 
      refreshToken 
    };
  } catch (err) {
    throw err;
  }
};

const handleAuthCallback = async (
  user: DecodedUser,
): Promise<{
  user: User;
  accessToken: string;
  refreshToken: string;
}> => {
  if (!user) throw createError("USER_NOT_FOUND");
  
  // Need to fetch full user to get DTO
  const dbUser = await UserRepo.findById(user.id);
  if (!dbUser) throw createError("USER_NOT_FOUND");

  const accessToken = jwtUtils.generateToken(user.id, user.username);
  const refreshToken = jwtUtils.generateRefreshToken(user.id, user.username);

  return { user: UserMapper.toUserDTO(dbUser), accessToken, refreshToken };
};

const refreshTokens = async (
  refreshToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  try {
    const decoded = jwtUtils.verifyRefreshToken(refreshToken);

    const user = await UserRepo.findById(decoded.id);
    if (!user) throw createError("USER_NOT_FOUND");

    const newAccessToken = jwtUtils.generateToken(user.id, user.username);
    const newRefreshToken = jwtUtils.generateRefreshToken(
      user.id,
      user.username,
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (err) {
    throw err;
  }
};

const register = async (
  username: string,
  email: string,
  password: string,
): Promise<User> => {
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

    const user = await UserRepo.createUser(username, email, password);

    return UserMapper.toUserDTO(user);
  } catch (err) {
    throw err;
  }
};

const sendOtp = async (email: string): Promise<void> => {
  try {
    const user = await UserRepo.findByEmail(email);

    if (!user) throw createError("USER_NOT_FOUND");
    if (user.emailVerified) throw createError("EMAIL_ALREADY_VERIFIED");

    return await otpService.sendOtp(user.id, email, OtpType.EmailVerification);
  } catch (err) {
    throw err;
  }
};

const validateOtp = async (email: string, otp: string): Promise<void> => {
  try {
    const user = await UserRepo.findByEmail(email);
    if (!user) throw createError("USER_NOT_FOUND");

    // Verify OTP using the new service
    await otpService.verifyOtp(user.id, otp, OtpType.EmailVerification);

    // Mark user as email verified
    await UserRepo.safeUpdate({ email }, { emailVerified: true });
  } catch (err) {
    throw err;
  }
};

const updatePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<User> => {
  try {
    const user = await UserRepo.findById(userId);
    if (!user) throw createError("USER_NOT_FOUND");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw createError("INVALID_CURRENT_PASSWORD");

    if (currentPassword === newPassword) throw createError("SAME_PASSWORD");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await UserRepo.safeUpdate(
      { id: user.id },
      { password: hashedPassword },
    );

    return UserMapper.toUserDTO(updatedUser!);
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
      { tokenExpiry, resetToken: token },
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
      { password: hashedPassword, $unset: { resetToken: 1, tokenExpiry: 1 } },
    );
  } catch (err) {
    throw err;
  }
};

  return {
    login,
    sendOtp,
    register,
    validateOtp,
    resetPassword,
    updatePassword,
    refreshTokens,
    sendPasswordEmail,
    handleAuthCallback,
  };
};

export type AuthServiceType = ReturnType<typeof createAuthService>;
