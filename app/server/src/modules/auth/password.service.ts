import bcrypt from "bcrypt";

import { config } from "shared/config/config";

import { env } from "@/config/env";
import { EmailService } from "@/ports/email.port";
import { TokenService } from "@/ports/token.port";
import { createError } from "@/shared/errors";
import { AccountProviders, User } from "shared/types/user";
import { UserMapper } from "../users/user.mapper";
import { UserRepository } from "../users/user.repository.port";

type PasswordServiceDeps = {
  userRepository: UserRepository;
  emailService: EmailService;
  tokenService: TokenService;
  getEmailTemplate: (templateName: string) => string;
};

export function createPasswordService({
  userRepository,
  emailService,
  tokenService,
getEmailTemplate,
}: PasswordServiceDeps) {

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

  return {
    resetPassword,
    updatePassword,
    sendPasswordEmail,
  };
}

export type PasswordServiceType = ReturnType<typeof createPasswordService>;