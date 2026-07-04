import passport from "passport";
import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { validate } from "@/shared/http/middleware/validate.middleware";
import {
  requireAuth,
  requireResetToken,
} from "@/shared/http/middleware/auth.middleware";
import { emailSchema } from "shared/schemas/user/user.schema";
import {
  loginSchema,
  otpSchema,
  registrationSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "shared/schemas/auth/auth.schema";
import { strategies } from "./auth.providers";
import { AuthController } from "./auth.controller";

export function createAuthRoutes(
  authController: AuthController,
): ExpressRouter {
  const router: ReturnType<typeof Router> = Router();

  router.post("/login", validate(loginSchema), authController.login);
  router.post("/register", validate(registrationSchema), authController.register);
  router.post("/logout", requireAuth, authController.logout);

  router.post("/refresh", authController.refresh);

  router.post("/send-otp", validate(emailSchema, "body", "email"), authController.sendOtp);
  router.put("/validate-otp", validate(otpSchema), authController.validateOtp);

  router.put("/update-password", requireResetToken, validate(resetPasswordSchema), authController.resetPassword);
  router.post("/reset-password", validate(emailSchema, "body", "email"), authController.sendPasswordEmail);
  router.put("/change-password", requireAuth, validate(updatePasswordSchema), authController.updatePassword);

  router.get("/providers", authController.providers);

  strategies.forEach(({ name }) => {
    router.get(
      `/${name}`,
      passport.authenticate(name, { scope: ["profile", "email"] }),
    );

    router.get(
      `/${name}/callback`,
      passport.authenticate(name, {
        failureRedirect: "/login",
        session: false,
      }),
      authController.handleAuthCallback,
    );
  });

  return router;
}
