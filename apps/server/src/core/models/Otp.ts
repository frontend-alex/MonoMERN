import { OtpType } from "@shared/types/otp";
import mongoose, { Schema, Document } from "mongoose";

interface IOtp extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  code: string;
  type: OtpType;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  isExpired(): boolean;
}

const otpSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      length: 6,
    },
    type: {
      type: String,
      enum: ['email_verification', 'password_reset', 'login'],
      required: true,
      default: 'email_verification',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ userId: 1, type: 1, isUsed: 1 });
otpSchema.index({ code: 1, type: 1 });

otpSchema.methods.isExpired = function (): boolean {
  return Date.now() > this.expiresAt.getTime();
};

const Otp = mongoose.model<IOtp>("Otp", otpSchema);

export { Otp };
export type { IOtp };
