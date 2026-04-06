import bcrypt from "bcrypt";

import mongoose, { Schema, Document } from "mongoose";
import { AccountProviders } from "@shared/types/user";

interface IUser extends Document {
  id:string;
  username: string;
  email: string;
  password: string;
  provider: keyof typeof AccountProviders;
  hasPassword: boolean;
  emailVerified: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  resetToken?: string;

  matchPassword(entered: string): Promise<boolean>;
  isResetTokenExpired(): boolean;
}

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 6,
      maxlength: 20,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    provider: {
      type: String,
      enum: Object.values(AccountProviders),
      default: AccountProviders.Credentials,
    },
    password: {
      type: String,
      required: false,
    },
    resetToken: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    hasPassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
    this.hasPassword = true;
  }
  next();
});

userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return this.password ? bcrypt.compare(enteredPassword, this.password) : false;
};

userSchema.methods.isResetTokenExpired = function (): boolean {
  return !!(this.resetTokenExpires && Date.now() > this.resetTokenExpires);
};

const User = mongoose.model<IUser>("User", userSchema);

export { User };
export type { IUser };
