import bcrypt from "bcrypt";

import { env } from "@/config/env";
import { OtpType } from "shared/types/otp";
import { config } from "shared/config/config";
import { AccountProviders, User } from "shared/types/user";
import { createError } from "@/shared/errors/create-error";
import { UserRepository } from "@/modules/users/user-repository.interface";
import { UserMapper } from "@/modules/users/user.mapper";
import { OtpServiceType } from "./otp/otp.service";
import { TokenService } from "./interfaces/token-service.interface";
import { EmailService } from "./interfaces/email-service.interface";
import { AuthenticatedUser } from "./auth.types";

type AuthServiceDeps = {
  userRepository: UserRepository;
  otpService: OtpServiceType;
  tokenService: TokenService;
  emailService: EmailService;
  getEmailTemplate: (templateName: string) => string;
};

export const createAuthService = ({
  userRepository,
  otpService,
  tokenService,
  emailService,
  getEmailTemplate,
}: AuthServiceDeps) => {
  const login = async (
    email: string,
    password: string,
  ): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> => {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) throw createError("INVALID_CREDENTIALS");

    if (user.provider != AccountProviders.Credentials) {
      throw createError("INVALID_CREDENTIALS");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw createError("INVALID_CREDENTIALS");

    if (!user.emailVerified) {
      throw createError("EMAIL_NOT_VERIFIED", {
        extra: { otpRedirect: true, email },
      });
    }

    const payload = { id: user.id, username: user.username };
    const accessToken = tokenService.generateAccessToken(payload);
    const refreshToken = tokenService.generateRefreshToken(payload);

    return {
      user: UserMapper.toUserDTO(user),
      accessToken,
      refreshToken,
    };
  };

  const handleAuthCallback = async (
    user: AuthenticatedUser,
  ): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> => {
    if (!user) throw createError("USER_NOT_FOUND");

    const dbUser = await userRepository.findById(user.id);
    if (!dbUser) throw createError("USER_NOT_FOUND");

    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);

    return { user: UserMapper.toUserDTO(dbUser), accessToken, refreshToken };
  };

  const refreshTokens = async (
    refreshToken: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> => {
    const decoded = tokenService.verifyRefreshToken(refreshToken);

    const user = await userRepository.findById(decoded.id);
    if (!user) throw createError("USER_NOT_FOUND");

    const payload = { id: user.id, username: user.username };
    const newAccessToken = tokenService.generateAccessToken(payload);
    const newRefreshToken = tokenService.generateRefreshToken(payload);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ): Promise<User> => {
    const existingUserEmail = await userRepository.findByEmail(email);
    if (existingUserEmail) {
      if (!existingUserEmail.emailVerified) {
        throw createError("EMAIL_ALREADY_TAKEN", {
          extra: { otpRedirect: true, email },
        });
      }

      throw createError("EMAIL_ALREADY_TAKEN");
    }

    const existingUserUsername = await userRepository.findByUsername(username);
    if (existingUserUsername) throw createError("USERNAME_ALREADY_TAKEN");

    const user = await userRepository.createUser(username, email, password);

    return UserMapper.toUserDTO(user);
  };

  const sendOtp = async (email: string): Promise<void> => {
    const user = await userRepository.findByEmail(email);

    if (!user) throw createError("USER_NOT_FOUND");
    if (user.emailVerified) throw createError("EMAIL_ALREADY_VERIFIED");

    return await otpService.sendOtp(user.id, email, OtpType.EmailVerification);
  };

  const validateOtp = async (email: string, otp: string): Promise<void> => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw createError("USER_NOT_FOUND");

    await otpService.verifyOtp(user.id, otp, OtpType.EmailVerification);
    await userRepository.safeUpdate({ email }, { emailVerified: true });
  };

  const updatePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<User> => {
    const user = await userRepository.findById(userId);
    if (!user) throw createError("USER_NOT_FOUND");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw createError("INVALID_CURRENT_PASSWORD");

    if (currentPassword === newPassword) throw createError("SAME_PASSWORD");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await userRepository.safeUpdate(
      { id: user.id },
      { password: hashedPassword },
    );

    return UserMapper.toUserDTO(updatedUser!);
  };

  const sendPasswordEmail = async (email: string) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw createError("USER_NOT_FOUND");

    if (user.provider !== AccountProviders.Credentials) {
      throw createError("ACCOUNT_ALREADY_CONNECTED_WITH_PROVIDER");
    }

    const token = tokenService.generateAccessToken({
      id: user.id,
      username: user.username,
    });

    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await userRepository.safeUpdate(
      { _id: user.id },
      { tokenExpiry, resetToken: token },
    );

    const resetLink = `${env.CORS_ORIGINS}/reset-password`;
    const emailTemplate = getEmailTemplate("reset-password");

    const html = emailTemplate
      .replace("{{RESET_LINK}}", resetLink)
      .replace("{{APP_NAME}}", config.app.name)
      .replace("{{YEAR}}", new Date().getFullYear().toString());

    await emailService.sendEmail(email, "Reset Password Link", html);

    return { token };
  };

  const resetPassword = async (userId: string, newPassword: string) => {
    const user = await userRepository.findById(userId);
    if (!user) throw createError("USER_NOT_FOUND");

    if (newPassword === user.password) throw createError("SAME_PASSWORD");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userRepository.safeUpdate(
      { _id: user.id },
      { password: hashedPassword, $unset: { resetToken: 1, tokenExpiry: 1 } },
    );
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
