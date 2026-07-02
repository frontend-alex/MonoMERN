import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { createAuthRoutes } from "@/modules/auth/auth.routes";
import { createUserRoutes } from "@/modules/users/user.routes";

export function createApiV1Routes(): ExpressRouter {
  const router: ExpressRouter = Router();

  router.use("/auth", createAuthRoutes());
  router.use("/user", createUserRoutes());

  return router;
}
