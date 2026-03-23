
import { createUserService } from "@/core/services/user/user.service";
import { UserRepo } from "@/dal/repositories/user/user.repository";

const UserService = createUserService(UserRepo);
import { NextFunction, Request, Response } from "express";

const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserService.getUser(req.user?.id!);

    res.status(200).json({
      success: true,
      message: "Data successfully fetched",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id!;
  const data = req.body;

  try {
    await UserService.updateUser(userId, data);

    res.status(200).json({
      success: true,
      message: "Changes successfully made",
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id!;

  try {
    await UserService.deleteUser(userId);
    res.status(201).json({
      success: true,
      message: "Account successfully deleted",
    });
  } catch (err) {
    next(err);
  }
};

export const UserController = {
  getUser,
  updateUser,
  deleteUser,
};
