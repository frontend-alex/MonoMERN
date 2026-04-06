import { Router } from "express";
import { publicAuthRoutes } from "./auth/public.routes";
import { protectedAuthRoutes } from "./auth/private.routes";
import { protectedUserRoutes } from "./user/private.routes";

const router: ReturnType<typeof Router> = Router();

router.use("/auth", publicAuthRoutes);
router.use("/auth", protectedAuthRoutes);

router.use("/user", protectedUserRoutes);

export { router };
