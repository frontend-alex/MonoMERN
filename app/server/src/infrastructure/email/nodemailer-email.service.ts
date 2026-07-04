import nodemailer from "nodemailer";

import { env } from "@/config/env";
import { createError } from "@/shared/errors/error";
import { EmailService } from "@/ports/email.port";

const transporter = nodemailer.createTransport({
  service: env.OTP_EMAIL_SERVICE,
  auth: {
    user: env.OTP_EMAIL,
    pass: env.OTP_EMAIL_PASSWORD,
  },
});

export const nodemailerEmailService: EmailService = {
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await transporter.sendMail({
        from: env.OTP_EMAIL,
        to,
        subject,
        html,
      });
    } catch {
      throw createError("EMAIL_SENDING_FAILED");
    }
  },
};
