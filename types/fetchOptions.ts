export interface FetchOptions<TBody = unknown> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface FetchError extends Error {
  name: string;
  message: string;
  response?: Response; // Optional response for HTTP errors
}

// Add ServiceError for service-specific errors
export interface ServiceError extends Error {
  name: string;
  message: string;
  response?: Response; // Optional, for HTTP-related errors
  details?: string; // Optional, for additional error details
}
