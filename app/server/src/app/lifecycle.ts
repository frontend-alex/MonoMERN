import os from "os";
import cluster from "cluster";

import { env } from "@/config/env";
import { connectDB, disconnectDB } from "@/config/db";
import { logger } from "@/shared/logging/logger";
import { createApp } from "./create-app";
import { createHttpServer } from "./create-server";

export async function startServer() {
  if (env.CLUSTER_ENABLED && cluster.isPrimary) {
    const workers = env.CLUSTER_WORKERS || os.cpus().length;

    logger.info(`Master ${process.pid} is running with ${workers} workers`);

    for (let i = 0; i < workers; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      logger.warn(
        `Worker ${worker.process.pid} died (${signal || code}). Restarting...`,
      );
      cluster.fork();
    });

    return;
  }

  try {
    await connectDB();

    const app = createApp();
    const server = createHttpServer(app);

    server.listen(env.PORT, env.HOST, () => {
      logger.info(
        `Server running in ${env.NODE_ENV} mode on ${env.HOST}:${env.PORT}`,
      );
      logger.info(`CORS allowed origins: ${env.CORS_ORIGINS.join(", ")}`);
    });

    registerProcessHandlers(server);
  } catch (error) {
    logger.error("Error starting server:", { error });
    await disconnectDB();
    process.exit(1);
  }
}

function registerProcessHandlers(server: ReturnType<typeof createHttpServer>) {
  const gracefulShutdown = async () => {
    server.close(async () => {
      await disconnectDB();
      logger.info("Server closed");
      process.exit(0);
    });
  };

  process.on("unhandledRejection", (err: Error) => {
    logger.error("Unhandled Rejection:", { err });
    gracefulShutdown();
  });

  process.on("uncaughtException", (err: Error) => {
    logger.error("Uncaught Exception:", { err });
    gracefulShutdown();
  });

  process.on("SIGTERM", () => {
    logger.info("SIGTERM received. Shutting down gracefully...");
    gracefulShutdown();
  });
}
