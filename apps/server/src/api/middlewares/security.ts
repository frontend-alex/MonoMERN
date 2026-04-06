import hpp from 'hpp';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'mongo-sanitize';

import { Application } from 'express';

export const configureSecurity = (app: Application, env: typeof import('@/config/env').env) => {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: env.isProduction ? [] : null,
      },
    },
    hsts: env.isProduction,
    frameguard: { action: 'deny' },
  }));

  if (env.isProduction) {
    app.use(rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }));
  }

  app.use(cors({
    origin: env.CORS_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

  app.use(hpp());

  app.use((req, _res, next) => {
    req.body = sanitize(req.body);
    req.params = sanitize(req.params);
    next();
  });
};

function sanitize(input: any): any {
  if (input == null || typeof input !== 'object') return input;

  return JSON.parse(JSON.stringify(input), (key, value) => {
    if (key.startsWith('$') || key.includes('.')) return undefined;
    return mongoSanitize(value);
  });
}
