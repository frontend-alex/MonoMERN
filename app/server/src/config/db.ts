import mongoose from "mongoose";

import { env } from "./env";
import { logger } from "@/api/application/logging/logger";

const MONGO_URI = env.isProd ? env.DB_ATLAS_URI : env.DB_LOCAL_URI;

const MONGO_OPTIONS = {
  autoIndex: env.isProduction ? false : true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

export async function connectDB() {
  try {
    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", { err });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    await mongoose.connect(MONGO_URI, MONGO_OPTIONS);
  } catch (err) {
    logger.error("MongoDB connection failed:", { err });
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected gracefully");
  } catch (err) {
    logger.error("Error disconnecting MongoDB:", { err });
  }
}
