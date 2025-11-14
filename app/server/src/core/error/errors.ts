import { NextFunction, Request, Response } from "express";

import { logger } from "@/api/application/logging/logger";
import { ERROR_MESSAGES } from "@/shared/constants/errorMessages";

interface AppErrorParams {
  message: string;
  statusCode: number;
  errorCode: string;
  userMessage?: string;
  extra?: Record<string, any>;
}

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public userMessage?: string;
  public extra?: Record<string, any>;

  constructor({
    message,
    statusCode,
    errorCode,
    userMessage,
    extra,
  }: AppErrorParams) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.userMessage = userMessage;

    if (extra && typeof extra === "object") {
      this.extra = extra;
      Object.assign(this, extra);
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (
  type: keyof typeof ERROR_MESSAGES,
  overrides?: Partial<Pick<AppErrorParams, "userMessage" | "extra">>
): AppError => {
  const fallback = {
    message: "Unknown server error",
    statusCode: 500,
    errorCode: "UNKNOWN",
  };

  const base = ERROR_MESSAGES[type] ?? fallback;

  return new AppError({
    message: base.message,
    statusCode: base.statusCode || 500,
    errorCode: base.errorCode || "UNKNOWN",
     userMessage: overrides?.userMessage ?? base.userMessage,
    extra: overrides?.extra,
  });
};

export const errorHandler = (
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError ? err.errorCode : "UNKNOWN";
  const message = isAppError ? err.message : "Internal server error";
  const userMessage = isAppError ? err.userMessage : "Something went wrong";

  logger.error("Failed to handle request", {
    error: err.name,
    message: err.message
  });

  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    statusCode,
    userMessage,
    ...(isAppError && err.extra ? err.extra : {}),
  });
};
