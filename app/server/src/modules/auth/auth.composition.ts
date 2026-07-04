import { nodemailerEmailService } from "@/infrastructure/email/nodemailer-email.service";
import { getEmailTemplate } from "@/infrastructure/email/template-renderer";
import { jwtTokenService } from "@/infrastructure/token/jwt-token.service";
import { userRepository } from "@/modules/users/user.repository";
import { createAuthController } from "./auth.controller";
import { createAuthService } from "./auth.service";
import { otpRepository } from "./otp/otp.repository";
import { createOtpService } from "./otp/otp.service";
import { createPasswordService } from "./password.service";
import { createRegistrationService } from "./register.service";

export function createAuthModule() {
  const otpService = createOtpService({
    otpRepository,
    emailService: nodemailerEmailService,
    getEmailTemplate,
  });

  const registrationService = createRegistrationService({
    otpService
  });

  const passwordService = createPasswordService({
    userRepository,
    emailService: nodemailerEmailService,
    tokenService: jwtTokenService,
    getEmailTemplate,
  });

  const authService = createAuthService({
    userRepository,
    tokenService: jwtTokenService,
  });

  const authController = createAuthController(authService, passwordService, registrationService);

  return {
    authController,
  };
}
