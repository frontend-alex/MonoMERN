import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { validate } from "@/shared/http/middleware/validate.middleware";
import { requireAuth } from "@/shared/http/middleware/auth.middleware";
import { updateUserSchema } from "shared/schemas/user/user.schema";
import { UserController } from "./user.controller";

export function createUserRoutes(controller: UserController): ExpressRouter {
  const router: ReturnType<typeof Router> = Router();

  router.use(requireAuth);

  router.get("/me", controller.getUser);
  router.put("/update", validate(updateUserSchema), controller.updateUser);
  router.delete("/delete", controller.deleteUser);

  return router;
}
