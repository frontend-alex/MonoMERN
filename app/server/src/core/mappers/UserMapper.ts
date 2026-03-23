import { IUser } from "@/core/models/User";
import { AccountProviders, User } from "@shared/types/user";

const toUserDTO = (user: IUser): User => ({
  id: user._id!.toString(),
  username: user.username,
  email: user.email,
  provider: user.provider as AccountProviders,
  emailVerified: user.emailVerified,
  hasPassword: user.hasPassword,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const toUserDTOOrNull = (user: IUser | null): User | null =>
  user ? toUserDTO(user) : null;

export const UserMapper = {
  toUserDTO,
  toUserDTOOrNull,
};
