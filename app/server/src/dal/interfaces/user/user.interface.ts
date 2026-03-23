import { IUser } from "@/core/models/User";
import { AccountProviders } from "@shared/types/user";

export interface IUserRepo {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  findByEmailWithPassword(email: string): Promise<IUser | null>;
  safeUpdate(
    query: Record<string, any>,
    update: Record<string, any>,
  ): Promise<IUser | null>;
  updateUser(
    query: Record<string, any>,
    update: Record<string, any>,
  ): Promise<IUser | null>;
  deleteUser(id: string): Promise<IUser | null>;
  createUser(
    username: string,
    email: string,
    hashedPassword?: string,
  ): Promise<IUser>;
  createOAuthUser(
    username: string,
    email: string,
    provider: AccountProviders,
  ): Promise<IUser>;
}
