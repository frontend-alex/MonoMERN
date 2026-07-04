import { NextFunction, RequestHandler, Request, Response } from "express";

import { jwtTokenService } from "@/infrastructure/token/jwt-token.service";
import { TokenService } from "@/ports/token.port";
import { createError } from "@/shared/errors/error";


export function createTokenMiddleware(
  tokenService: TokenService,
  cookieNames: string[],
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const token = cookieNames.map((name) => req.cookies?.[name]).find(Boolean);

    if (!token) {
      return next(createError("INVALID_TOKEN"));
    }

    try {
      const decoded = tokenService.verifyAccessToken(token);

      if (!decoded.id) {
        return next(createError("INVALID_TOKEN"));
      }

      req.user = {
        id: decoded.id,
        username: decoded.username,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function createJwtMiddleware(tokenService: TokenService,): RequestHandler {
  return createTokenMiddleware(tokenService, ["access_token"]);
}

export function createResetTokenMiddleware(tokenService: TokenService): RequestHandler {
  return createTokenMiddleware(tokenService, ["access_token", "reset_token"]);
}

export const requireAuth: RequestHandler = createJwtMiddleware(jwtTokenService);

export const requireResetToken: RequestHandler = createResetTokenMiddleware(jwtTokenService);
