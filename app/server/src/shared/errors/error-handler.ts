import { NextFunction, Request, Response } from "express";

import { logger } from "@/shared/logging/logger";
import { AppError } from "./app-error";

export const errorHandler = (
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError ? err.errorCode : "UNKNOWN";
  const message = isAppError ? err.message : "Internal server error";
  const userMessage = isAppError ? err.userMessage : "Something went wrong";

  logger.error("Failed to handle request", {
    error: err.name,
    message: err.message,
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
