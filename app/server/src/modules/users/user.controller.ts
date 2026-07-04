import { NextFunction, Request, Response } from "express";

import { sendSuccess } from "@/shared/http/response";
import { UserServiceType } from "./user.service";
import { getAuthenticatedUser } from "@/shared/http/request";

export function createUserController(userService: UserServiceType) {
  return {
    getUser: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authenticatedUser = getAuthenticatedUser(req);
        const user = await userService.getUser(authenticatedUser.id);

        sendSuccess(res, 200, "Data successfully fetched", { user });
      } catch (err) {
        next(err);
      }
    },

    updateUser: async (req: Request, res: Response, next: NextFunction) => {
      try {

        const authenticatedUser = getAuthenticatedUser(req);
        await userService.updateUser(authenticatedUser.id, req.body);

          sendSuccess(res, 200, "Changes successfully made");
        } catch (err) {
        next(err);
      }
    },

    deleteUser: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authenticatedUser = getAuthenticatedUser(req);
        await userService.deleteUser(authenticatedUser.id);

        sendSuccess(res, 201, "Account successfully deleted");
      } catch (err) {
        next(err);
      }
    },
  };
}

export type UserController = ReturnType<typeof createUserController>;
