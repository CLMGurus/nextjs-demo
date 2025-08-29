import { createBrowserClient } from "@supabase/ssr";
import { fetchWithAuth } from "@/lib/fetchApi/utils";
import { FetchOptions } from "@/types/fetchOptions";

export async function fetchWithClientToken<TResponse, TBody = unknown>(
  endpoint: string,
  options: FetchOptions<TBody> = {}
): Promise<TResponse> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error("No session found. Please login first.");
  }

  const token = session.access_token;
  if (!token) {
    throw new Error("No access token found. Please login first.");
  }

  return fetchWithAuth<TResponse, TBody>(endpoint, token, options);
}
