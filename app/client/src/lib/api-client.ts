import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiErrorResponse } from "@shared/types/api";
import { API } from "@/config/config";
import { ROUTE_HELPERS, ROUTES } from "@/config/routes";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT = 30_000;
const isDev = import.meta.env.DEV;

export const API_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim();
  }
  return "http://localhost:3000/api/v1/";
})();

// ─────────────────────────────────────────────────────────────────────────────
// Auth Event System - Decoupled auth state management
// ─────────────────────────────────────────────────────────────────────────────

export const AUTH_EVENTS = {
  SESSION_EXPIRED: "auth:session-expired",
  REFRESH_SUCCESS: "auth:refresh-success",
  REFRESH_FAILED: "auth:refresh-failed",
} as const;

type AuthEventType = (typeof AUTH_EVENTS)[keyof typeof AUTH_EVENTS];

const emitAuthEvent = (event: AuthEventType, detail?: unknown) => {
  window.dispatchEvent(new CustomEvent(event, { detail }));
};

export const onAuthEvent = (
  event: AuthEventType,
  callback: (e: CustomEvent) => void
) => {
  const handler = callback as EventListener;
  window.addEventListener(event, handler);
  return () => window.removeEventListener(event, handler);
};

// ─────────────────────────────────────────────────────────────────────────────
// Token Refresh Queue - Handles concurrent requests during token refresh
// ─────────────────────────────────────────────────────────────────────────────

type QueuedRequest = {
  resolve: () => void;
  reject: (error: AxiosError) => void;
};

class TokenRefreshQueue {
  private isRefreshing = false;
  private queue: QueuedRequest[] = [];

  get refreshing() {
    return this.isRefreshing;
  }

  set refreshing(value: boolean) {
    this.isRefreshing = value;
  }

  enqueue(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
    });
  }

  processQueue(error: AxiosError | null) {
    this.queue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    this.queue = [];
  }

  clear() {
    this.queue = [];
    this.isRefreshing = false;
  }
}

const refreshQueue = new TokenRefreshQueue();

// ─────────────────────────────────────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// Request Interceptor - Logging & Request Enhancement
// ─────────────────────────────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    if (isDev) {
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error: AxiosError) => {
    if (isDev) {
      console.error("[API] Request error:", error.message);
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Response Interceptor - Error Handling & Token Refresh
// ─────────────────────────────────────────────────────────────────────────────

// Endpoints where refresh should not be attempted:
// - All public auth endpoints (login, register, etc.) - user isn't authenticated yet
// - GET /me: Used to check auth status - 401 means "not authenticated"  
// - POST /refresh: The refresh endpoint itself - prevents infinite loops
const shouldSkipRefresh = (url?: string): boolean => {
  if (!url) return false;
  
  if (ROUTE_HELPERS.isPublicRoute(url)) {
    return true;
  }
  
  return false;
};

const handleSessionExpired = () => {
  refreshQueue.clear();
  emitAuthEvent(AUTH_EVENTS.SESSION_EXPIRED);
  
  // Don't redirect if we're already on a public/auth route to prevent refresh loops
  
  if (!ROUTE_HELPERS.isPublicRoute(window.location.pathname)) {
    window.location.href = ROUTES.PUBLIC.LOGIN;
  }
};

const attemptTokenRefresh = async (
  originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }
): Promise<AxiosResponse> => {
  // Queue concurrent requests while refresh is in progress
  if (refreshQueue.refreshing) {
    await refreshQueue.enqueue();
    return api(originalRequest);
  }

  originalRequest._retry = true;
  refreshQueue.refreshing = true;

  try {
    await api.post(API.AUTH.PUBLIC.REFRESH);

    emitAuthEvent(AUTH_EVENTS.REFRESH_SUCCESS);
    refreshQueue.processQueue(null);

    return api(originalRequest);
  } catch (refreshError) {
    const error = refreshError as AxiosError<ApiErrorResponse>;

    emitAuthEvent(AUTH_EVENTS.REFRESH_FAILED, error);
    refreshQueue.processQueue(error);
    handleSessionExpired();

    return Promise.reject(refreshError);
  } finally {
    refreshQueue.refreshing = false;
  }
};

api.interceptors.response.use(
  (response) => {
    // Handle custom API error responses that return 200 status
    if (response.data && response.data.success === false) {
      const errorResponse: ApiErrorResponse = response.data;
      if (isDev) {
        console.warn("[API] Business logic error:", errorResponse.message);
      }
      return Promise.reject(
        new axios.AxiosError(
          errorResponse.message,
          errorResponse.errorCode,
          response.config,
          response.request,
          response
        )
      );
    }
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (isDev) {
      console.error(
        `[API] ${error.response?.status ?? "Network"} Error:`,
        error.response?.data?.message ?? error.message
      );
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (shouldSkipRefresh(originalRequest.url)) {
        return Promise.reject(error);
      }
      
      return attemptTokenRefresh(originalRequest);
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an AbortController for request cancellation
 * @returns Tuple of [signal, abort function]
 *
 * @example
 * const [signal, abort] = createAbortSignal();
 * api.get('/endpoint', { signal });
 * // Later: abort();
 */
export const createAbortSignal = (): [AbortSignal, () => void] => {
  const controller = new AbortController();
  return [controller.signal, () => controller.abort()];
};

/**
 * Type guard to check if error is an API error
 */
export const isApiError = (
  error: unknown
): error is AxiosError<ApiErrorResponse> => {
  return axios.isAxiosError(error);
};

/**
 * Extracts user-friendly message from API error
 */
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return (
      error.response?.data?.userMessage ??
      error.response?.data?.message ??
      error.message
    );
  }
  return error instanceof Error ? error.message : "An unexpected error occurred";
};

export default api;
