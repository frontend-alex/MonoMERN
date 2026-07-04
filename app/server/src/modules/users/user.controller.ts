import { NextFunction, Request, Response } from "express";

import { sendSuccess } from "@/shared/http/response";
import { UserServiceType } from "./user.service";

export function createUserController(userService: UserServiceType) {
  return {
    getUser: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = await userService.getUser(req.user?.id!);

        sendSuccess(res, 200, "Data successfully fetched", { user });
      } catch (err) {
        next(err);
      }
    },

    updateUser: async (req: Request, res: Response, next: NextFunction) => {
      try {
        await userService.updateUser(req.user?.id!, req.body);

        sendSuccess(res, 200, "Changes successfully made");
      } catch (err) {
        next(err);
      }
    },

    deleteUser: async (req: Request, res: Response, next: NextFunction) => {
      try {
        await userService.deleteUser(req.user?.id!);
        sendSuccess(res, 201, "Account successfully deleted");
      } catch (err) {
        next(err);
      }
    },
  };
}

export type UserController = ReturnType<typeof createUserController>;
