import type { FieldValues, UseFormReturn } from "react-hook-form";
import type {
  LoginSchemaType,
  OtpSchemaType,
  RegistrationSchemaType,
  resetPasswordSchemaType,
  updatePasswordSchemaType,
} from "@shared/schemas/auth/auth.schema";
import type { Providers } from "@/features/auth/forms/buttons/provider-buttons";

type BaseFormProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  handleSubmit: (data: T) => void;
  isPending: boolean;
};

type WithProviders = {
  providers?: Providers[];
};

export type LoginFormProps = BaseFormProps<LoginSchemaType> & WithProviders;

export type RegisterFormProps = BaseFormProps<RegistrationSchemaType> &
  WithProviders;

export type OtpFormProps = BaseFormProps<OtpSchemaType> & {
  isOtpVerifying: boolean;
  cooldown: number;
  resendOtp: () => void;
};

export type ForgotPasswordFormProps = BaseFormProps<{ email: string }>;

export type UpdatePasswordFormProps = BaseFormProps<updatePasswordSchemaType>;

export type ResetPasswordFormProps = BaseFormProps<resetPasswordSchemaType>;
