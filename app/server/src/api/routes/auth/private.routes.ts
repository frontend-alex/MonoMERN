import { Router } from "express";
import { jwtMiddleware } from "@/api/middlewares/auth";
import { validate } from "@/api/middlewares/validation";
import { AuthController } from "@/api/controllers/auth/auth.controller";
import { updateUserSchema } from "@shared/schemas/user/user.schema";
import { UserController } from "@/api/controllers/user/user.controller";
import { updatePasswordSchema } from "@shared/schemas/auth/auth.schema";


const router = Router();

router.use(jwtMiddleware);

router.get("/me", UserController.getUser);
router.post("/logout", AuthController.logout);
router.delete("/delete", UserController.deleteUser);

router.put("/update", validate(updateUserSchema), UserController.updateUser);
router.put("/change-password", validate(updatePasswordSchema), AuthController.updatePassword);


export { router as protectedAuthRoutes };
