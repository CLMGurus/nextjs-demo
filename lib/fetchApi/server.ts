import { getUserWithToken } from "@/utils/supabase/getUserWithToken";
import { fetchWithAuth } from "@/lib/fetchApi/utils";
import { FetchOptions } from "@/types/fetchOptions";

export async function fetchWithToken<TResponse, TBody = unknown>(
  endpoint: string,
  options: FetchOptions<TBody> = {}
): Promise<TResponse> {
  const user = await getUserWithToken();
  const token = user?.accessToken;

  if (!token) {
    throw new Error("No access token found. Please login first.");
  }

  return fetchWithAuth<TResponse, TBody>(endpoint, token, options);
}
