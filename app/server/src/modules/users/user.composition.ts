import { createUserController } from "./user.controller";
import { userRepository } from "./user.repository";
import { createUserService } from "./user.service";

export function createUserModule() {
  const userService = createUserService(userRepository);
  const userController = createUserController(userService);

  return {
    userController,
  };
}
