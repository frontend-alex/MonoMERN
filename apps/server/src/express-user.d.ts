// src/types/express.d.ts
import { Request as ExpressRequest } from 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
    }
    interface Request {
      user?: User;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      username: string;
    };
  }
}