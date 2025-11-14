import "module-alias/register";
import '@/config/passport'

import os from "os";
import fs from "fs";
import cluster from "cluster";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";

import { router } from "./api/routes";
import { env, getAppUrl } from "@/config/env";
import { createServer } from "http";
import { logger } from "@/api/application/logging/logger";
import { errorHandler } from "@/core/error/errors";
import { connectDB, disconnectDB } from "@/config/db";
import { createServer as createHttpsServer } from "https";
import { configureSecurity } from "@/api/middlewares/security";
import express, { Application, ErrorRequestHandler } from "express";

/**
 * AppServer - Core application server class that handles:
 * - HTTP/HTTPS server creation
 * - Middleware configuration
 * - Route handling
 * - Cluster management
 * - Graceful shutdown
 *
 * Usage:
 * 1. Import and extend this class for custom functionality
 * 2. Add routes in configureRoutes()
 * 3. Start with AppServer.run()
 */
class AppServer {
  private app: Application;
  private server: ReturnType<typeof createServer> | undefined;

  constructor() {
    // Initialize Express application
    this.app = express();

    // Configure middleware and routes
    this.configureMiddleware();
    this.configureRoutes();
  }

  /**
   * Configures application middleware stack
   * - Body parsing with size limits
   * - Security headers and protections
   * - Proxy trust settings
   */
  private configureMiddleware() {
    // JSON body parser with configurable limit (default: 10kb)
    this.app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));

    // URL-encoded body parser
    this.app.use(
      express.urlencoded({ extended: true, limit: env.REQUEST_BODY_LIMIT })
    );

    // Apply security middleware (helmet, CORS, rate limiting, etc.)
    configureSecurity(this.app, env);

    // Configure proxy trust levels (important when behind load balancer)
    this.app.set("trust proxy", env.TRUST_PROXY);

    this.app.use(cookieParser())

    this.app.use(
      session({
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
      })
    );

    // Initialize passport
    this.app.use(passport.initialize());
    this.app.use(passport.session());
  }

  /**
   * Configures application routes
   * - Add your API routes here
   * - Health check endpoint included by default
   */
  private configureRoutes() {
    // Basic health check endpoint
    this.app.get("/health", (req, res) => {
      res.status(201).json({ status: "ok", url:getAppUrl() });
    }); 


    // Example: Uncomment and customize for your API routes
    this.app.use("/api/v1", router);

    this.app.use(errorHandler as unknown as ErrorRequestHandler);
  }

  /**
   * Creates HTTP or HTTPS server based on configuration
   * @returns {http.Server|https.Server} Configured server instance
   */

  private createServer() {
    // Create HTTPS server if enabled and certificates are provided
    if (env.HTTPS_ENABLED && env.SSL_CERT_PATH && env.SSL_KEY_PATH) {
      const options = {
        cert: fs.readFileSync(env.SSL_CERT_PATH),
        key: fs.readFileSync(env.SSL_KEY_PATH),
      };
      return createHttpsServer(options, this.app);
    }

    // Fall back to HTTP server
    return createServer(this.app);
  }

  /**
   * Returns the Express application instance
   * - Useful for testing or extending functionality
   * @returns {Application} Express application instance
   */
  public getApp(): Application {
    return this.app;
  }

  /**
   * Starts the application server
   * - Connects to database
   * - Initializes server
   * - Sets up error handlers
   */
  public async start() {
    try {
      // Establish database connection
      await connectDB();

      // Create server instance
      this.server = this.createServer();

      // Start listening on configured port and host
      this.server.listen(env.PORT, env.HOST, () => {
        logger.info(
          `Server running in ${env.NODE_ENV} mode on ${env.HOST}:${env.PORT}`
        );
        logger.info(`CORS allowed origins: ${env.CORS_ORIGINS.join(", ")}`);
      });

      // Configure error handlers
      this.setupErrorHandlers();
    } catch (error) {
      logger.error("Error starting server:", { error });
      await disconnectDB();
      process.exit(1);
    }
  }

  /**
   * Configures global error handlers
   * - Unhandled rejections
   * - Uncaught exceptions
   * - SIGTERM signals
   */
  private setupErrorHandlers() {
    // Handle promise rejections that weren't caught
    process.on("unhandledRejection", (err: Error) => {
      logger.error("Unhandled Rejection:", { err });
      this.gracefulShutdown();
    });

    // Handle exceptions that bubbled up to the event loop
    process.on("uncaughtException", (err: Error) => {
      logger.error("Uncaught Exception:", { err });
      this.gracefulShutdown();
    });

    // Handle graceful shutdown signals
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received. Shutting down gracefully...");
      this.gracefulShutdown();
    });
  }

  /**
   * Gracefully shuts down the server
   * - Closes server connections
   * - Disconnects from database
   * - Exits process cleanly
   */
  private async gracefulShutdown() {
    this.server?.close(async () => {
      await disconnectDB();
      logger.info("Server closed");
      process.exit(0);
    });
  }

  /**
   * Starts the application in cluster mode if enabled
   * - Creates worker processes for each CPU core
   * - Automatically restarts failed workers
   * - Falls back to single process in development
   */
  public static run() {
    // Cluster mode (production only)
    if (env.CLUSTER_ENABLED && cluster.isPrimary) {
      const workers = env.CLUSTER_WORKERS || os.cpus().length;
      logger.info(`Master ${process.pid} is running with ${workers} workers`);

      // Fork workers
      for (let i = 0; i < workers; i++) {
        cluster.fork();
      }

      // Handle worker exits (auto-restart)
      cluster.on("exit", (worker, code, signal) => {
        logger.warn(
          `Worker ${worker.process.pid} died (${signal || code}). Restarting...`
        );
        cluster.fork();
      });
    } else {
      // Single process mode
      new AppServer().start();
    }
  }
}

export default AppServer;
