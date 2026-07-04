import { AppError, AppErrorParams } from "./app-error";
import { ERROR_MESSAGES } from "./error-messages";

export function createError(
  type: keyof typeof ERROR_MESSAGES,
  overrides?: Partial<Pick<AppErrorParams, "userMessage" | "extra">>,
): AppError {
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
}
