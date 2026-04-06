import api from "@/lib/api-client";
import { useQuery, useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import type {
  ApiSuccessResponse,
  ApiError,
  ApiResponse
} from "@shared/types/api";

const DEFAULT_STALE_TIME = 5 * 60 * 1000; 

/* Query Options */
type QueryOptions<T, R = ApiSuccessResponse<T>> = {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchInterval?: number;
  select?: (data: ApiSuccessResponse<T>) => R;
  onSuccess?: (data: R) => void;
  onError?: (error: ApiError) => void;
};

/* Mutation Options */
type MutationOptions<T, U = unknown, R = ApiSuccessResponse<T>> = {
  invalidateQueries?: QueryKey[];
  onSuccess?: (data: R, variables: U) => void;
  onError?: (error: ApiError, variables: U) => void;
};

/* Base Fetcher */
const fetcher = async <T>(endpoint: string): Promise<ApiSuccessResponse<T>> => {
  const response = await api.get<ApiResponse<T>>(endpoint);
  if (!response.data.success) throw response;
  return response.data;
};

/* Query Hook */
export const useApiQuery = <T, R = ApiSuccessResponse<T>>(
  queryKey: QueryKey,
  endpoint: string,
  options?: QueryOptions<T, R>
) => {
  return useQuery<ApiSuccessResponse<T>, ApiError, R>({
    queryKey,
    queryFn: () => fetcher<T>(endpoint),
    refetchOnWindowFocus: false,
    staleTime: options?.staleTime ?? DEFAULT_STALE_TIME,
    enabled: options?.enabled,
    select: options?.select,
    retry: 1,
    refetchInterval: options?.refetchInterval,
  });
};

/* Mutation Hook */
export const useApiMutation = <T, U = unknown, R = ApiSuccessResponse<T>>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string | ((data: U) => string),
  options?: MutationOptions<T, U, R>
) => {
  const queryClient = useQueryClient();

  return useMutation<ApiSuccessResponse<T>, ApiError, U, R>({
    mutationFn: async (data: U) => {
      const resolvedEndpoint = typeof endpoint === "function" ? endpoint(data) : endpoint;
      let response;
      switch (method) {
        case "POST":
          response = await api.post<ApiResponse<T>>(resolvedEndpoint, data);
          break;
        case "PUT":
          response = await api.put<ApiResponse<T>>(resolvedEndpoint, data);
          break;
        case "PATCH":
          response = await api.patch<ApiResponse<T>>(resolvedEndpoint, data);
          break;
        case "DELETE":
          response = await api.delete<ApiResponse<T>>(resolvedEndpoint, data ? { data } : undefined);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      if (!response.data.success) throw response;
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      options?.onSuccess?.(data as R, variables);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });
};