import { Application, ErrorRequestHandler } from "express";

import { getAppUrl } from "@/config/env";
import { errorHandler } from "@/shared/errors/error-handler";
import { createApiV1Routes } from "./api-v1.routes";

export function registerRoutes(app: Application) {
  app.get("/health", (_req, res) => {
    res.status(201).json({ status: "ok", url: getAppUrl() });
  });

  app.use("/api/v1", createApiV1Routes());

  app.use(errorHandler as unknown as ErrorRequestHandler);
}
