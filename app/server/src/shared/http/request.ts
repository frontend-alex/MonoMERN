import { Request } from "express";
import { createError } from "../errors";
import { AuthenticatedUser } from "@/modules/auth/auth.types";

export function getAuthenticatedUser(req: Request): AuthenticatedUser {
  if (!req.user?.id) {
    throw createError("INVALID_TOKEN");
  }

  return req.user;
}