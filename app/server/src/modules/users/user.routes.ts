import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { validate } from "@/shared/http/validate.middleware";
import { authMiddleware } from "@/shared/http/auth.middleware";
import { updateUserSchema } from "shared/schemas/user/user.schema";
import { createUserController } from "./user.controller";
import { createUserService } from "./user.service";
import { userRepository } from "./user.repository";

export function createUserRoutes(): ExpressRouter {
  const router: ReturnType<typeof Router> = Router();

  const userService = createUserService(userRepository);
  const controller = createUserController(userService);

  router.use(authMiddleware);

  router.get("/me", controller.getUser);
  router.put("/update", validate(updateUserSchema), controller.updateUser);
  router.delete("/delete", controller.deleteUser);

  return router;
}
