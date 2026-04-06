import { Router } from "express";
import { jwtMiddleware } from "@/api/middlewares/auth";
import { validate } from "@/api/middlewares/validation";
import { updateUserSchema } from "@shared/schemas/user/user.schema";
import { UserController } from "@/api/controllers/user/user.controller";

const router: ReturnType<typeof Router> = Router();

router.use(jwtMiddleware);

router.get("/me", UserController.getUser);
router.put("/update", validate(updateUserSchema), UserController.updateUser);
router.delete("/delete", UserController.deleteUser);

export { router as protectedUserRoutes };
