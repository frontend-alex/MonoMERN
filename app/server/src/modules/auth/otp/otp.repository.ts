import type { mongo } from "mongoose";
import { OtpType } from "shared/types/otp";

import { generateOTP } from "@/shared/utils/generate-otp";
import { Otp } from "./otp.model";
import { OtpRepository } from "./otp-repository.interface";

const createOtp = async (
  userId: string,
  type: OtpType,
  expiresInMinutes: number = 5,
) => {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  await Otp.updateMany({ userId, type, isUsed: false }, { isUsed: true });

  const otp = new Otp({
    userId,
    code,
    type,
    expiresAt,
  });

  return await otp.save();
};

const findByCodeAndType = async (code: string, type: OtpType) => {
  return await Otp.findOne({ code, type, isUsed: false });
};

const findByUserIdAndType = async (userId: string, type: OtpType) => {
  return await Otp.findOne({ userId, type, isUsed: false });
};

const markAsUsed = async (otpId: string) => {
  return await Otp.findByIdAndDelete(otpId);
};

const invalidateUserOtps = async (
  userId: string,
  type: OtpType,
): Promise<mongo.DeleteResult> => {
  return await Otp.deleteMany({ userId, type, isUsed: false });
};

const cleanupExpiredOtps = async (): Promise<mongo.DeleteResult> => {
  return await Otp.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

export const otpRepository: OtpRepository = {
  createOtp,
  findByCodeAndType,
  findByUserIdAndType,
  markAsUsed,
  invalidateUserOtps,
  cleanupExpiredOtps,
};

export const OtpRepo = otpRepository;
