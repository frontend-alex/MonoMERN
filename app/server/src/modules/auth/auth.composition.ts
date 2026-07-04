import { nodemailerEmailService } from "@/infrastructure/email/nodemailer-email.service";
import { getEmailTemplate } from "@/infrastructure/email/template-renderer";
import { jwtTokenService } from "@/infrastructure/token/jwt-token.service";
import { userRepository } from "@/modules/users/user.repository";
import { createAuthController } from "./auth.controller";
import { createAuthService } from "./auth.service";
import { otpRepository } from "./otp/otp.repository";
import { createOtpService } from "./otp/otp.service";

export function createAuthModule() {
  const otpService = createOtpService({
    otpRepository,
    emailService: nodemailerEmailService,
    getEmailTemplate,
  });

  const authService = createAuthService({
    userRepository,
    otpService,
    tokenService: jwtTokenService,
    emailService: nodemailerEmailService,
    getEmailTemplate,
  });

  const authController = createAuthController(authService);

  return {
    authController,
  };
}
