import { IUser, User } from "@/core/models/User";

import { config } from "@shared/config/config";
import { AccountProviders } from "@shared/types/user";
import { IUserRepo } from "@/infrastructure/interfaces/user/user.interface";

function filterAllowedUpdates<T extends Record<string, any>>(
  updates: T,
  allowedFields: string[],
): Partial<T> {
  return Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedFields.includes(key)),
  ) as Partial<T>;
}

const safeUpdate = async (
  query: Record<string, any>,
  update: Record<string, any>,
): Promise<IUser | null> => {
  return await User.findOneAndUpdate(query, update, { new: true });
};

const updateUser = async (
  query: Record<string, any>,
  update: Record<string, any>,
): Promise<IUser | null> => {
  const filteredUpdate = filterAllowedUpdates(
    update,
    config.user.allowedUpdates,
  );

  return await User.findOneAndUpdate(query, filteredUpdate, { new: true });
};

const findByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email }).select("-password -resetToken");
};

const findByEmailWithPassword = async (
  email: string,
): Promise<IUser | null> => {
  // Explictly grabbing the password here for login flows
  return await User.findOne({ email });
};

const findById = async (userId: string): Promise<IUser | null> => {
  return await User.findById(userId).select("-password -resetToken");
};

const findByUsername = async (username: string): Promise<IUser | null> => {
  return await User.findOne({ username }).select(
    "-email -createdAt -updatedAt -_id -password -resetToken",
  );
};

const deleteUser = async (userId: string): Promise<IUser | null> => {
  return await User.findByIdAndDelete(userId);
};

const createUser = async (
  username: string,
  email: string,
  hashedPassword?: string,
): Promise<IUser> => {
  const user = new User({
    email,
    username,
    password: hashedPassword,
  });

  await user.save();
  return user;
};

const createOAuthUser = async (
  username: string,
  email: string,
  provider: AccountProviders,
): Promise<IUser> => {
  const user = new User({
    email,
    username,
    provider,
    password: "",
    emailVerified: true,
    hasPassword: false,
  });

  await user.save();
  return user;
};

export const UserRepo: IUserRepo = {
  safeUpdate,
  updateUser,
  findByEmail,
  findByEmailWithPassword,
  findById,
  findByUsername,
  deleteUser,
  createUser,
  createOAuthUser,
};
