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

export type { AppErrorParams };
