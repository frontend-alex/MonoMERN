import passport from "passport";

import { Router } from "express";
import { validate } from "@/api/middlewares/validation";
import { strategies } from "@/shared/constants/authProviders";
import { emailSchema } from "@shared/schemas/user/user.schema";
import { AuthController } from "@/api/controllers/auth/auth.controller";
import {
  loginSchema,
  otpSchema,
  registrationSchema,
  resetPasswordSchema,
} from "@shared/schemas/auth/auth.schema";
import { resetTokenMiddleware } from "@/api/middlewares/password";

const router = Router();

router.post("/login", validate(loginSchema), AuthController.login);
router.post("/register", validate(registrationSchema), AuthController.register);

router.post(
  "/send-otp",
  validate(emailSchema, "body", "email"),
  AuthController.sendOtp
);
router.put("/validate-otp", validate(otpSchema), AuthController.validateOtp);
router.put(
  "/update-password",
  resetTokenMiddleware,
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

router.post(
  "/reset-password",
  validate(emailSchema, "body", "email"),
  AuthController.sendPasswordEmail
);



router.get("/providers", AuthController.providers);

strategies.forEach(({ name }) => {
  router.get(
    `/${name}`,
    passport.authenticate(name, { scope: ["profile", "email"] })
  );

  router.get(
    `/${name}/callback`,
    passport.authenticate(name, {
      failureRedirect: "/login",
      session: false,
    }),
    AuthController.handleAuthCallback
  );
});

export { router as publicAuthRoutes };
