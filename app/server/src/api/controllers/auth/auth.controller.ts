import { env } from "@/config/env";
import { DecodedUser } from "@/api/middlewares/auth";
import { NextFunction, Request, Response } from "express";
import { strategies } from "@/shared/constants/authProviders";
import { createAuthService } from "@/core/services/auth/auth.service";
import { createOtpService } from "@/core/services/auth/otp.service";
import { UserRepo } from "@/infrastructure/repositories/user/user.repository";
import { OtpRepo } from "@/infrastructure/repositories/auth/otp.repository";

const otpService = createOtpService(OtpRepo);
const AuthService = createAuthService(UserRepo, otpService);

const providers = (_req: Request, res: Response, next: NextFunction) => {
  try {
    const publicProviders = strategies
      .filter((s) => s.enabled)
      .map(({ name, label }) => ({
        name,
        label,
      }));

    res.status(201).json({
      success: true,
      message: "Providers successfully fetched",
      data: {
        publicProviders,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Cookie options for tokens
const ACCESS_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 60 * 60 * 1000, // 1 hour
  path: "/",
};

const REFRESH_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

const handleAuthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = await AuthService.handleAuthCallback(req.user as DecodedUser);

    const redirectUrl = Array.isArray(env.CORS_ORIGINS)
      ? env.CORS_ORIGINS[0]
      : env.CORS_ORIGINS;

    res.cookie("access_token", accessToken, ACCESS_TOKEN_OPTIONS);
    res.cookie("refresh_token", refreshToken, REFRESH_TOKEN_OPTIONS);

    res.status(201).redirect(`${redirectUrl}/auth/callback`);
  } catch (err) {
    next(err);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const { user, accessToken, refreshToken } = await AuthService.login(email, password);

    res.cookie("access_token", accessToken, ACCESS_TOKEN_OPTIONS);
    res.cookie("refresh_token", refreshToken, REFRESH_TOKEN_OPTIONS);

    res.status(201).json({
      success: true,
      message: "Successfully logged in",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, username } = req.body;

  try {
    await AuthService.register(username, email, password);

    res.status(201).json({
      success: true,
      message: "Registration successfully made",
      data: {
        email,
      },
    });
  } catch (err) {
    next(err);
  }
};

const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password, newPassword } = req.body;

  const userId = req.user?.id!;

  try {
    await AuthService.updatePassword(userId, password, newPassword);

    res.status(201).json({
      success: true,
      message: "Password successfully updated",
    });
  } catch (err) {
    next(err);
  }
};

const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {
    await AuthService.sendOtp(email);

    res.status(201).json({
      success: true,
      message: `Otp was successfully sent to ${email}`,
    });
  } catch (err) {
    next(err);
  }
};

const validateOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { email, pin } = req.body;

  try {
    await AuthService.validateOtp(email, pin);

    res.status(200).json({
      success: true,
      message: "Account successfully verfied",
    });
  } catch (err) {
    next(err);
  }
};

const sendPasswordEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  try {
    const { token } = await AuthService.sendPasswordEmail(email);

    res.cookie("reset_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(201).json({
      success: true,
      message: `Email was successfully sent to you`,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id!;
  const { newPassword } = req.body;
  try {
    await AuthService.resetPassword(userId, newPassword);

    res.clearCookie("reset_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.status(201).json({
      success: true,
      message: "Password Successfully changed",
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "Refresh token not found",
    });
  }

  try {
    const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshTokens(refreshToken);

    res.cookie("access_token", accessToken, ACCESS_TOKEN_OPTIONS);
    res.cookie("refresh_token", newRefreshToken, REFRESH_TOKEN_OPTIONS);

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
    });
  } catch (err) {
    // Clear invalid tokens
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    return next(err);
  }
};

const logout = async (_req: Request, res: Response, _next: NextFunction) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Successfully logged out",
  });
};

export const AuthController = {
  login,
  logout,
  refresh,
  sendOtp,
  register,
  providers,
  validateOtp,
  resetPassword,
  updatePassword,
  sendPasswordEmail,
  handleAuthCallback,
};
