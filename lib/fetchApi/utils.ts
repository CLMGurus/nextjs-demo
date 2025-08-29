import { FetchOptions, FetchError } from "@/types/fetchOptions";

export async function fetchWithAuth<TResponse, TBody = unknown>(
  endpoint: string,
  token: string,
  options: FetchOptions<TBody> = {}
): Promise<TResponse> {
  const { method = "GET", body, query, headers = {}, signal } = options;

  if (!token) {
    throw new Error("No access token provided.");
  }

  const queryString = query
    ? "?" +
      Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(
          ([k, v]) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
        )
        .join("&")
    : "";

  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}${queryString}`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("fetchWithAuth: Error response body:", errorText);
      const error: FetchError = new Error(
        `Failed to ${method} ${endpoint}: ${errorText}`
      );
      error.response = res;
      throw error;
    }

    if (res.status === 204) {
      return {} as TResponse;
    }

    return res.json();
  } catch (error: unknown) {
    const fetchError = error as FetchError;
    if (fetchError.name === "AbortError") {
      console.warn(`Request to ${endpoint} was aborted`);
      throw new Error("Request was canceled");
    }
    console.error("fetchWithAuth error:", fetchError.message);
    throw fetchError;
  }
}
