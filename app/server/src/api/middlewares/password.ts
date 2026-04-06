import { env } from "@/config/env";
import jwt, { Secret } from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { createError } from "@/core/error/errors";
import { NextFunction, RequestHandler, Request, Response } from "express";

export interface DecodedUser extends JwtPayload {
  id: string;
  username: string;
}

export const resetTokenMiddleware: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.access_token;
  const resetToken = req.cookies?.reset_token;

  const token = accessToken || resetToken;

  if (!token) {
    return next(createError("INVALID_TOKEN"));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET as Secret) as DecodedUser;

    if (!decoded?.id) {
      return next(createError("INVALID_TOKEN"));
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (err) {
    next(createError("INVALID_TOKEN"));
  }
};
