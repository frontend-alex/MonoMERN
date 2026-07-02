import { config } from "../../config/config";
import z from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long");

const rules = config.user.passwordRules;

export const passwordSchema = z
  .string()
  .min(
    rules.minLength,
    `Password must be at least ${rules.minLength} characters long`
  )
  .refine((val) => !rules.requireUppercase || /[A-Z]/.test(val), {
    message: "Must contain an uppercase letter",
  })
  .refine((val) => !rules.requireLowercase || /[a-z]/.test(val), {
    message: "Must contain a lowercase letter",
  })
  .refine((val) => !rules.requireNumber || /[0-9]/.test(val), {
    message: "Must contain a number",
  })
  .refine((val) => !rules.requireSymbol || /[^a-zA-Z0-9]/.test(val), {
    message: "Must contain a special character",
  });

export type passwordSchemaType = z.infer<typeof passwordSchema>;

export const updateUserSchema = z
  .object({
    email: emailSchema.optional(),
    username: usernameSchema.optional(),
    password: passwordSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please provide at least one field to update",
  });

export type updateUserSchemaType = z.infer<typeof updateUserSchema>;
