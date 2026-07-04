import { OtpType, User } from "shared";
import { userRepository } from "../users/user.repository";
import { UserMapper } from "../users/user.mapper";
import { createError } from "@/shared/errors/error";
import { OtpServiceType } from "./otp/otp.service";

type RegistrationServiceDeps = {
  otpService: OtpServiceType;
};

export function createRegistrationService({
  otpService,
}: RegistrationServiceDeps) {
  const register = async (
    username: string,
    email: string,
    password: string,
  ): Promise<User> => {
    const existingUserEmail = await userRepository.findByEmail(email);
    if (existingUserEmail) {
      if (!existingUserEmail.emailVerified) {
        throw createError("EMAIL_ALREADY_TAKEN", {
          extra: { otpRedirect: true, email },
        });
      }

      throw createError("EMAIL_ALREADY_TAKEN");
    }

    const existingUserUsername = await userRepository.findByUsername(username);
    if (existingUserUsername) throw createError("USERNAME_ALREADY_TAKEN");

    const user = await userRepository.createUser(username, email, password);

    return UserMapper.toUserDTO(user);
  };

  const sendOtp = async (email: string): Promise<void> => {
    const user = await userRepository.findByEmail(email);

    if (!user) throw createError("USER_NOT_FOUND");
    if (user.emailVerified) throw createError("EMAIL_ALREADY_VERIFIED");

    return await otpService.sendOtp(user.id, email, OtpType.EmailVerification);
  };

  const validateOtp = async (email: string, otp: string): Promise<void> => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw createError("USER_NOT_FOUND");

    await otpService.verifyOtp(user.id, otp, OtpType.EmailVerification);
    await userRepository.safeUpdate({ email }, { emailVerified: true });
  };

  return {
    register,
    sendOtp,
    validateOtp,
  };
}


export type RegistrationServiceType = ReturnType<typeof createRegistrationService>;