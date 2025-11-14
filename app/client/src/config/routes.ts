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
  ONBOARDING: "/app/v1/onboarding",
  PROFILE: `${BASE_PATHS.APP}/profile`,
  SETTINGS: `${BASE_PATHS.APP}/settings`,
  BILLING: `${BASE_PATHS.APP}/billing`,
  CALENDAR: `${BASE_PATHS.APP}/calendar`,
  INBOX: (workspaceId: string | number) =>
    `${BASE_PATHS.APP}/${workspaceId}/inbox`,
  WORKSPACE: (workspaceId: string | number) =>
    `${BASE_PATHS.APP}/workspace/${workspaceId}`,
  WORKSPACE_CHAT: (workspaceId: string | number, chatId: string | number) =>
    `${BASE_PATHS.APP}/workspace/${workspaceId}/chats/${chatId}`,
  LIST: (listId: string | number, listName: string) =>
    `${BASE_PATHS.APP}/${listId}/${listName}`,
  LIST_SETTINGS: (listId: string | number) =>
    `${BASE_PATHS.APP}/${listId}/settings`,
} as const;

export const ROUTE_HELPERS = {
  isAuthenticatedRoute: (path: string): boolean => {
    return path.startsWith(BASE_PATHS.APP);
  },

  isPublicRoute: (path: string): boolean => {
    return Object.values(PUBLIC_ROUTES).includes(path as any);
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
