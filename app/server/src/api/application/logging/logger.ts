import os from 'os';
import chalk from 'chalk';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { inspect } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { performance } from 'perf_hooks';
import { TransformableInfo } from 'logform';

type LogContext = Record<string, unknown>;
type LogMetadata = {
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  service?: string;
  [key: string]: unknown;
};

// Log severity levels
const LOG_LEVELS = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
  perf: 6, 
};

const LEVEL_COLORS = {
  fatal: chalk.bgRed.white.bold,
  error: chalk.red.bold,
  warn: chalk.yellow.bold,
  info: chalk.cyan.bold,
  debug: chalk.magenta.bold,
  trace: chalk.gray.bold,
  perf: chalk.green.bold,
  http: chalk.green.bold,
};

const formatMessage = (info: TransformableInfo): string => {
  const { level, message, timestamp, ...meta } = info;
  const coloredLevel = LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]?.(`[${level.toUpperCase()}]`) || `[${level}]`;
  
  let output = `${coloredLevel} ${chalk.gray(`[${timestamp}]`)} ${message}`;
  
  if (Object.keys(meta).length > 0) {
    const formattedMeta = inspect(meta, {
      colors: true,
      depth: 5,
      compact: true,
      breakLength: process.stdout.columns || 80,
    });
    output += `\n${chalk.gray('↳')} ${formattedMeta}`;
  }
  
  return output;
};

const jsonFormatter = (info: TransformableInfo): any => {
  const { level, message, timestamp, ...meta } = info;
  return {
    level,
    message,
    timestamp,
    hostname: os.hostname(),
    pid: process.pid,
    ...meta,
  };
};

class PerformanceTracker {
  private static marks = new Map<string, number>();

  static start(markName: string): void {
    this.marks.set(markName, performance.now());
  }

  static end(markName: string): { duration: number; markName: string } {
    const startTime = this.marks.get(markName);
    if (!startTime) {
      throw new Error(`Performance mark '${markName}' not found`);
    }
    const duration = performance.now() - startTime;
    this.marks.delete(markName);
    return { duration, markName };
  }
}

// Main logger class
class EnterpriseLogger {
  private logger: winston.Logger;
  private context: LogContext = {};
  private metadata: LogMetadata = {};

  constructor() {
    this.logger = winston.createLogger({
      levels: LOG_LEVELS,
      level: process.env.LOG_LEVEL || 'info',
      // defaultMeta: {
      //   service: process.env.SERVICE_NAME || 'unknown-service',
      //   hostname: os.hostname(),
      //   environment: process.env.NODE_ENV || 'development',
      // },
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format((info) => {
          if (!info.correlationId && this.metadata.correlationId) {
            info.correlationId = this.metadata.correlationId;
          }
          return { ...this.context, ...this.metadata, ...info };
        })(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: false }),
            winston.format.printf(formatMessage),
          ),
          silent: process.env.NODE_ENV === 'test',
        }),
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
          format: winston.format.combine(
            winston.format.json(),
            winston.format(jsonFormatter)(),
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '7d',
          format: winston.format.combine(
            winston.format.json(),
            winston.format(jsonFormatter)(),
          ),
        }),
      ],
      exitOnError: false,
    });

    if (process.env.LOG_HTTP === 'true') {
      this.logger.add(new winston.transports.File({
        filename: 'logs/http.log',
        level: 'http',
        format: winston.format.combine(
          winston.format.json(),
          winston.format(jsonFormatter)(),
        ),
      }));
    }
  }

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  setMetadata(metadata: LogMetadata): void {
    this.metadata = { ...this.metadata, ...metadata };
  }

  generateCorrelationId(): string {
    const correlationId = uuidv4();
    this.metadata.correlationId = correlationId;
    return correlationId;
  }

  fatal(message: string, meta?: LogMetadata): void {
    this.logger.log('fatal', message, meta);
  }

  error(message: string, meta?: LogMetadata): void {
    this.logger.log('error', message, meta);
  }

  warn(message: string, meta?: LogMetadata): void {
    this.logger.log('warn', message, meta);
  }

  info(message: string, meta?: LogMetadata): void {
    this.logger.log('info', message, meta);
  }

  debug(message: string, meta?: LogMetadata): void {
    this.logger.log('debug', message, meta);
  }

  trace(message: string, meta?: LogMetadata): void {
    this.logger.log('trace', message, meta);
  }

  http(message: string, meta?: LogMetadata): void {
    this.logger.log('http', message, meta);
  }

  startPerformanceMark(markName: string): void {
    PerformanceTracker.start(markName);
  }

  endPerformanceMark(markName: string, meta?: LogMetadata): void {
    const { duration, markName: name } = PerformanceTracker.end(markName);
    this.logger.log('perf', `Performance mark '${name}' completed in ${duration.toFixed(2)}ms`, {
      ...meta,
      durationMs: duration,
      performanceMark: name,
    });
  }

  child(context: LogContext): EnterpriseLogger {
    const childLogger = new EnterpriseLogger();
    childLogger.setContext({ ...this.context, ...context });
    childLogger.setMetadata({ ...this.metadata });
    return childLogger;
  }
}

const logger = new EnterpriseLogger();

export { logger, EnterpriseLogger, PerformanceTracker };