import { User } from "shared/types/user";

import { createError } from "@/shared/errors/error";
import { UserMapper } from "./user.mapper";
import { UserRepository } from "./user.repository.port";

export function createUserService(userRepository: UserRepository) {
  const getUser = async (userId: string): Promise<User> => {
    const user = await userRepository.findById(userId);
    if (!user) throw createError("USER_NOT_FOUND");

    return UserMapper.toUserDTO(user);
  };

  const updateUser = async (
    userId: string,
    updateData: Record<string, any>,
  ): Promise<void> => {
    if (Object.keys(updateData).length === 0) {
      throw createError("NO_UPDATES_PROVIDED");
    }

    if ("email" in updateData) {
      updateData.emailVerified = false;
    }

    await userRepository.updateUser({ _id: userId }, updateData);
  };

  const deleteUser = async (userId: string) => {
    if (!userId) throw createError("USER_NOT_FOUND");

    const result = await userRepository.deleteUser(userId);
    if (!result) throw createError("USER_NOT_FOUND");
  };

  return { getUser, updateUser, deleteUser };
}

export type UserServiceType = ReturnType<typeof createUserService>;
