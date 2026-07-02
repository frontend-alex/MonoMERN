import passport from "passport";
import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { validate } from "@/shared/http/validate.middleware";
import { authMiddleware } from "@/shared/http/auth.middleware";
import { resetTokenMiddleware } from "@/shared/http/reset-token.middleware";
import { emailSchema, updateUserSchema } from "shared/schemas/user/user.schema";
import {
  loginSchema,
  otpSchema,
  registrationSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "shared/schemas/auth/auth.schema";
import { createUserController } from "@/modules/users/user.controller";
import { createUserService } from "@/modules/users/user.service";
import { userRepository } from "@/modules/users/user.repository";
import { strategies } from "./auth.providers";
import { createAuthController } from "./auth.controller";
import { createAuthModule } from "./auth.module";

export function createAuthRoutes(): ExpressRouter {
  const router: ReturnType<typeof Router> = Router();

  const { authService } = createAuthModule();
  
  const authController = createAuthController(authService);
  const userService = createUserService(userRepository);
  const userController = createUserController(userService);

  router.post("/login", validate(loginSchema), authController.login);
  router.post("/register", validate(registrationSchema), authController.register);
  router.post("/refresh", authController.refresh);

  router.post(
    "/send-otp",
    validate(emailSchema, "body", "email"),
    authController.sendOtp,
  );
  router.put("/validate-otp", validate(otpSchema), authController.validateOtp);
  router.put(
    "/update-password",
    resetTokenMiddleware,
    validate(resetPasswordSchema),
    authController.resetPassword,
  );

  router.post(
    "/reset-password",
    validate(emailSchema, "body", "email"),
    authController.sendPasswordEmail,
  );

  router.get("/providers", authController.providers);

  router.get("/me", authMiddleware, userController.getUser);
  router.post("/logout", authMiddleware, authController.logout);
  router.delete("/delete", authMiddleware, userController.deleteUser);
  router.put(
    "/update",
    authMiddleware,
    validate(updateUserSchema),
    userController.updateUser,
  );
  router.put(
    "/change-password",
    authMiddleware,
    validate(updatePasswordSchema),
    authController.updatePassword,
  );

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
