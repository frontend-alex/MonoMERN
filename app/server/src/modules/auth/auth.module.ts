import { userRepository } from "@/modules/users/user.repository";
import { jwtTokenService } from "@/infrastructure/token/jwt-token.service";
import { nodemailerEmailService } from "@/infrastructure/email/nodemailer-email.service";
import { getEmailTemplate } from "@/infrastructure/email/template-renderer";
import { createAuthService } from "./auth.service";
import { createOtpService } from "./otp/otp.service";
import { otpRepository } from "./otp/otp.repository";

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

  return {
    authService,
    otpService,
  };
}
