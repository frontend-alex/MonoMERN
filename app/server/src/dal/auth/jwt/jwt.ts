import { env } from "@/config/env";
import jwt, { Secret } from "jsonwebtoken";
import { createError } from "@/core/error/errors";
import { DecodedUser } from "@/api/middlewares/auth";

const generateToken = (
  userId: string,
  username: string,
  rememberMe?: boolean,
): string => {
  return jwt.sign({ id: userId, username }, env.JWT_SECRET as Secret, {
    expiresIn: rememberMe ? "1h" : "7d",
  });
};

const generateRefreshToken = (userId: string, username: string): string => {
  return jwt.sign({ id: userId, username }, env.JWT_REFRESH_SECRET as Secret, {
    expiresIn: "7d",
  });
};

const verifyToken = (token: string): DecodedUser => {
  try {
    return jwt.verify(token, env.JWT_SECRET as Secret) as DecodedUser;
  } catch {
    throw createError("INVALID_TOKEN");
  }
};

const verifyRefreshToken = (token: string): DecodedUser => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET as Secret) as DecodedUser;
  } catch {
    throw createError("INVALID_REFRESH_TOKEN");
  }
};

const refreshAccessToken = (refreshToken: string): string => {
  const { id, username } = verifyRefreshToken(refreshToken);
  return generateToken(id, username);
};

export const jwtUtils = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  refreshAccessToken,
};
