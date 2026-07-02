import { AuthenticatedUser } from "@/modules/auth/auth.types";

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
    interface Request {
      user?: User;
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
  }
}
