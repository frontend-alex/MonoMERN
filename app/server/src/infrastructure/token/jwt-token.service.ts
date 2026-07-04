import jwt, { Secret } from "jsonwebtoken";

import { env } from "@/config/env";
import { createError } from "@/shared/errors/error";
import { TokenPayload } from "@/modules/auth/auth.types";
import { TokenService } from "@/ports/token.port";

export const jwtTokenService: TokenService = {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET as Secret, {
      expiresIn: "1h",
    });
  },

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET as Secret, {
      expiresIn: "7d",
    });
  },

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET as Secret) as TokenPayload;
    } catch {
      throw createError("INVALID_TOKEN");
    }
  },

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET as Secret) as TokenPayload;
    } catch {
      throw createError("INVALID_REFRESH_TOKEN");
    }
  },
};
