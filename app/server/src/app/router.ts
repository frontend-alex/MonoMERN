import { Application, ErrorRequestHandler } from "express";

import { getAppUrl } from "@/config/env";
import { errorHandler } from "@/shared/errors/error-handler";
import { createAuthRoutes } from "@/modules/auth/auth.routes";
import { createUserRoutes } from "@/modules/users/user.routes";
import { createAuthModule } from "@/modules/auth/auth.composition";
import { createUserModule } from "@/modules/users/user.composition";

export function registerRoutes(app: Application) {
  const { authController } = createAuthModule();
  const { userController } = createUserModule();

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", url: getAppUrl() });
  });

  

  app.use("/api/v1/auth", createAuthRoutes(authController));
  app.use("/api/v1/user", createUserRoutes(userController));

  app.use(errorHandler as unknown as ErrorRequestHandler);
}
