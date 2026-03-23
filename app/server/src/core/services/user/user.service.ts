import { createError } from "@/core/error/errors";
import { UserMapper } from "@/core/mappers/UserMapper";
import { User } from "@shared/types/user";
import { IUserRepo } from "@/dal/interfaces/user/user.interface";

export const createUserService = (UserRepo: IUserRepo) => {
  const getUser = async (userId: string): Promise<User> => {
    const user = await UserRepo.findById(userId);
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

    await UserRepo.updateUser({ _id: userId }, updateData);
  };

  const deleteUser = async (userId: string) => {
    try {
      if (!userId) throw createError("USER_NOT_FOUND");

      const result = await UserRepo.deleteUser(userId);
      if (!result) throw createError("USER_NOT_FOUND");
    } catch (err) {
      throw err;
    }
  };

  return { getUser, updateUser, deleteUser };
};

export type UserServiceType = ReturnType<typeof createUserService>;
