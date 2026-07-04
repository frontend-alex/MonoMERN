import express, { Application } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import { env } from "@/config/env";
import { configureSecurity } from "@/shared/security/security";

export function registerMiddlewares(app: Application) {
  app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));

  app.use(
    express.urlencoded({
      extended: true,
      limit: env.REQUEST_BODY_LIMIT,
    }),
  );

  configureSecurity(app, env);

  app.set("trust proxy", env.TRUST_PROXY);

  app.use(cookieParser());

  app.use(
    session({
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
}
