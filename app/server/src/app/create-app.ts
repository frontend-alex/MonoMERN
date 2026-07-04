import "module-alias/register";
import "@/config/passport";

import express, { Application } from "express";

import { registerRoutes } from "./router";
import { registerMiddlewares } from "../shared/http/middleware/app.middleware";

export function createApp(): Application {
  const app = express();

  registerMiddlewares(app);
  registerRoutes(app);

  return app;
}
