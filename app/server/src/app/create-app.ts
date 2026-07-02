import "module-alias/register";
import "@/config/passport";

import express, { Application } from "express";

import { registerMiddlewares } from "./register-middlewares";
import { registerRoutes } from "./register-routes";

export function createApp(): Application {
  const app = express();

  registerMiddlewares(app);
  registerRoutes(app);

  return app;
}
