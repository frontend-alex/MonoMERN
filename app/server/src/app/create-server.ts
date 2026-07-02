import fs from "fs";
import { createServer } from "http";
import { createServer as createHttpsServer } from "https";
import { Application } from "express";

import { env } from "@/config/env";

export function createHttpServer(app: Application) {
  if (env.HTTPS_ENABLED && env.SSL_CERT_PATH && env.SSL_KEY_PATH) {
    return createHttpsServer(
      {
        cert: fs.readFileSync(env.SSL_CERT_PATH),
        key: fs.readFileSync(env.SSL_KEY_PATH),
      },
      app,
    );
  }

  return createServer(app);
}
