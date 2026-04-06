export const BASE_PATHS = {
  APP: "/app/v1",
  AUTH: "/auth",
} as const;

export const PUBLIC_ROUTES = {
  LANDING: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/auth/verify-email",
  AUTH_CALLBACK: "/auth/callback",
} as const;

export const AUTHENTICATED_ROUTES = {
  DASHBOARD: `${BASE_PATHS.APP}/dashboard`,
  PROFILE: `${BASE_PATHS.APP}/profile`,
  SETTINGS: `${BASE_PATHS.APP}/settings`,
} as const;

export const ROUTE_HELPERS = {
  isAuthenticatedRoute: (path: string): boolean => {
    return path.startsWith(BASE_PATHS.APP);
  },

  isPublicRoute: (path: string): boolean => {
    return (Object.values(PUBLIC_ROUTES) as string[]).includes(path);
  },
} as const;

export const getCurrentRoute = (pathname: string) => {
  const match = pathname.match(BASE_PATHS.APP + "/([^/]+)");
  return match ? match[1] : "";
};

export const ROUTES = {
  PUBLIC: PUBLIC_ROUTES,
  AUTHENTICATED: AUTHENTICATED_ROUTES,
  BASE: BASE_PATHS,
  HELPERS: ROUTE_HELPERS,
} as const;
