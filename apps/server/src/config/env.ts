import * as dotenv from "dotenv";
import { cleanEnv, str, num, bool, makeValidator } from "envalid";

const corsValidator = makeValidator((input: string) => {
  const origins = input.split(",");
  return origins.map((origin) => origin.trim());
});

dotenv.config();

export const env = cleanEnv(process.env, {
  // Runtime
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
  }),
  PORT: num({ default: 3000 }),
  HOST: str({ default: "localhost" }),

  // Security
  TRUST_PROXY: num({ default: 0 }),
  RATE_LIMIT_WINDOW_MS: num({ default: 15 * 60 * 1000 }),
  RATE_LIMIT_MAX: num({ default: 100 }),
  CORS_ORIGINS: corsValidator({ default: ["http://localhost:5173"] }),
  CSRF_COOKIE_SECURE: bool({ default: false }),

  // HTTPS
  HTTPS_ENABLED: bool({ default: false }),
  SSL_CERT_PATH: str({ default: "" }),
  SSL_KEY_PATH: str({ default: "" }),
  SESSION_SECRET: str(),

  // Cluster
  CLUSTER_ENABLED: bool({ default: false }),
  CLUSTER_WORKERS: num({ default: 0 }),

  // Advanced
  REQUEST_BODY_LIMIT: str({ default: "10kb" }),
  TRUSTED_PROXIES: str({ default: "" }),

  // Database
  DB_LOCAL_URI: str({ default: "" }),
  DB_ATLAS_URI: str({ default: ""}),

  // OTP Email
  OTP_EMAIL: str(),
  OTP_EMAIL_PASSWORD: str(),
  OTP_EMAIL_SERVICE: str({ default: "gmail" }),
  OTP_EXPIRY: num({ default: 5 * 60 * 1000 }),

  // JWT
  JWT_SECRET: str(),
  JWT_REFRESH_SECRET: str(),
  JWT_EXPIRATION: str({ default: "1h" }),

  // === SOCIAL AUTH ===

  // Google
  GOOGLE_CLIENT_ID: str({ default: "" }),
  GOOGLE_CLIENT_SECRET: str({ default: "" }),

  // GitHub
  GITHUB_CLIENT_ID: str({ default: "" }),
  GITHUB_CLIENT_SECRET: str({ default: "" }),

  // Facebook
  FACEBOOK_CLIENT_ID: str({ default: "" }),
  FACEBOOK_CLIENT_SECRET: str({ default: "" }),

  // Twitter
  TWITTER_CONSUMER_KEY: str({ default: "" }),
  TWITTER_CONSUMER_SECRET: str({ default: "" }),

  // LinkedIn
  LINKEDIN_CLIENT_ID: str({ default: "" }),
  LINKEDIN_CLIENT_SECRET: str({ default: "" }),

  // Instagram
  INSTAGRAM_CLIENT_ID: str({ default: "" }),
  INSTAGRAM_CLIENT_SECRET: str({ default: "" }),

  // Auth0
  AUTH0_DOMAIN: str({ default: "" }),
  AUTH0_CLIENT_ID: str({ default: "" }),
  AUTH0_CLIENT_SECRET: str({ default: "" }),

  // Spotify
  SPOTIFY_CLIENT_ID: str({ default: "" }),
  SPOTIFY_CLIENT_SECRET: str({ default: "" }),

  // Generic OAuth2 (Optional/Fallback)
  OAUTH2_CLIENT_ID: str({ default: "" }),
  OAUTH2_CLIENT_SECRET: str({ default: "" }),
});

export function getAppUrl() {
  const protocol = env.HTTPS_ENABLED ? "https" : "http";
  const host = env.HOST === "0.0.0.0" ? "localhost" : env.HOST;
  const port = env.PORT;

  const portSegment =
    (protocol === "http" && port === 80) || (protocol === "https" && port === 443)
      ? ""
      : `:${port}`;

  return `${protocol}://${host}${portSegment}`;
}