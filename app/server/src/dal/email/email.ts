import fs from "fs";
import path from "path";
import { env } from "@/config/env";
import nodemailer from "nodemailer";
import { createError } from "@/core/error/errors";

const transporter = nodemailer.createTransport({
  service: env.OTP_EMAIL_SERVICE,
  auth: {
    user: env.OTP_EMAIL,
    pass: env.OTP_EMAIL_PASSWORD,
  },
});

const getEmailTemplate = (templateName: string): string => {
  const templatePath = path.resolve(__dirname, `../../infrastructure/email/templates/${templateName}.html`);
  try {
    return fs.readFileSync(templatePath, "utf-8");
  } catch(err) {
    console.log(err)
    throw createError("EMAIL_SENDING_FAILED");
  }
};

const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: env.OTP_EMAIL,
      to,
      subject,
      html,
    });
  } catch (err) {
    throw createError("EMAIL_SENDING_FAILED");
  }
};


export const EmailUtils = {
  getEmailTemplate,
  sendEmail
}