import { AccountProviders, User } from "shared/types/user";
import { createError } from "@/shared/errors/error";
import { UserRepository } from "@/modules/users/user.repository.port";
import { UserMapper } from "@/modules/users/user.mapper";
import { TokenService } from "@/ports/token.port";
import { AuthenticatedUser } from "./auth.types";

type AuthServiceDeps = {
  userRepository: UserRepository;
  tokenService: TokenService;
};

export function createAuthService({
  userRepository,
  tokenService,
}: AuthServiceDeps) {
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

  return {
    login,
    refreshTokens,
    handleAuthCallback,
  };
}

export type AuthServiceType = ReturnType<typeof createAuthService>;
