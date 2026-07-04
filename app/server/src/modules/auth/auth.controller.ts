import { NextFunction, Request, Response } from "express";

import { env } from "@/config/env";
import { sendSuccess } from "@/shared/http/response";
import { strategies } from "./auth.providers";
import { AuthServiceType } from "./auth.service";
import { AuthenticatedUser } from "./auth.types";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
  RESET_TOKEN_COOKIE_OPTIONS,
} from "./auth.cookies";
import { PasswordServiceType } from "./password.service";
import { RegistrationServiceType } from "./register.service";

export function createAuthController(
  authService: AuthServiceType,
  passwordService: PasswordServiceType,
  registrationService: RegistrationServiceType,
) {
  return {
    providers: (_req: Request, res: Response, next: NextFunction) => {
      try {
        const publicProviders = strategies
          .filter((s) => s.enabled)
          .map(({ name, label }) => ({
            name,
            label,
          }));

        sendSuccess(res, 201, "Providers successfully fetched", {
          publicProviders,
        });
      } catch (err) {
        next(err);
      }
    },

    handleAuthCallback: async (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      try {
        const { accessToken, refreshToken } =
          await authService.handleAuthCallback(req.user as AuthenticatedUser);

        const redirectUrl = Array.isArray(env.CORS_ORIGINS)
          ? env.CORS_ORIGINS[0]
          : env.CORS_ORIGINS;

        res.cookie("access_token", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
        res.cookie("refresh_token", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

        res.status(201).redirect(`${redirectUrl}/auth/callback`);
      } catch (err) {
        next(err);
      }
    },

    login: async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;

      try {
        const { user, accessToken, refreshToken } = await authService.login(
          email,
          password,
        );

        res.cookie("access_token", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
        res.cookie("refresh_token", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

        sendSuccess(res, 201, "Successfully logged in", { user });
      } catch (err) {
        next(err);
      }
    },

    register: async (req: Request, res: Response, next: NextFunction) => {
      const { email, password, username } = req.body;

      try {
        await registrationService.register(username, email, password);

        sendSuccess(res, 201, "Registration successfully made", { email });
      } catch (err) {
        next(err);
      }
    },

    updatePassword: async (req: Request, res: Response, next: NextFunction) => {
      const { password, newPassword } = req.body;
      const userId = req.user?.id!;

      try {
        await passwordService.updatePassword(userId, password, newPassword);

        sendSuccess(res, 201, "Password successfully updated");
      } catch (err) {
        next(err);
      }
    },

    sendOtp: async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;

      try {
        await registrationService.sendOtp(email);

        sendSuccess(res, 201, `Otp was successfully sent to ${email}`);
      } catch (err) {
        next(err);
      }
    },

    validateOtp: async (req: Request, res: Response, next: NextFunction) => {
      const { email, pin } = req.body;

      try {
        await registrationService.validateOtp(email, pin);

        sendSuccess(res, 200, "Account successfully verfied");
      } catch (err) {
        next(err);
      }
    },

    sendPasswordEmail: async (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      const { email } = req.body;
      try {
        const { token } = await passwordService.sendPasswordEmail(email);

        res.cookie("reset_token", token, RESET_TOKEN_COOKIE_OPTIONS);

        sendSuccess(res, 201, `Email was successfully sent to you`);
      } catch (err) {
        next(err);
      }
    },

    resetPassword: async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id!;
      const { newPassword } = req.body;
      try {
        await passwordService.resetPassword(userId, newPassword);

        res.clearCookie("reset_token", RESET_TOKEN_COOKIE_OPTIONS);

        sendSuccess(res, 201, "Password Successfully changed");
      } catch (err) {
        next(err);
      }
    },

    refresh: async (req: Request, res: Response, next: NextFunction) => {
      const refreshToken = req.cookies?.refresh_token;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token not found",
        });
      }

      try {
        const { accessToken, refreshToken: newRefreshToken } =
          await authService.refreshTokens(refreshToken);

        res.cookie("access_token", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
        res.cookie(
          "refresh_token",
          newRefreshToken,
          REFRESH_TOKEN_COOKIE_OPTIONS,
        );

        sendSuccess(res, 200, "Tokens refreshed successfully");
      } catch (err) {
        res.clearCookie("access_token", { path: "/" });
        res.clearCookie("refresh_token", { path: "/" });
        return next(err);
      }
    },

    logout: async (_req: Request, res: Response, _next: NextFunction) => {
      res.clearCookie("access_token", ACCESS_TOKEN_COOKIE_OPTIONS);
      res.clearCookie("refresh_token", REFRESH_TOKEN_COOKIE_OPTIONS);

      sendSuccess(res, 200, "Successfully logged out");
    },
  };
}

export type AuthController = ReturnType<typeof createAuthController>;
