import type { mongo } from "mongoose";
import { IOtp } from "@/core/models/Otp";
import { OtpType } from "@shared/types/otp";

export interface IOtpRepo {
  createOtp(
    userId: string,
    type: OtpType,
    expiresInMinutes?: number,
  ): Promise<IOtp>;
  findByCodeAndType(code: string, type: OtpType): Promise<IOtp | null>;
  findByUserIdAndType(userId: string, type: OtpType): Promise<IOtp | null>;
  markAsUsed(otpId: string): Promise<IOtp | null>;
  invalidateUserOtps(
    userId: string,
    type: OtpType,
  ): Promise<mongo.DeleteResult>;
  cleanupExpiredOtps(): Promise<mongo.DeleteResult>;
}
