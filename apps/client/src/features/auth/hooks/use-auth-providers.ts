import { API } from "@/config/config";

import { useApiQuery } from "@/hooks/use-api-mutation";
import type { Providers } from "@/features/auth/forms/buttons/provider-buttons";

export const useAuthProviders = () => {
  const query = useApiQuery<{ publicProviders: Providers[] }>(
    ["auth", "providers"],
    API.AUTH.PUBLIC.PROVIDERS,
  );

  return {
    ...query,
    providers: query.data?.data?.publicProviders ?? [],
  };
};
