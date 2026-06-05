import type { ApiError } from "../types";

export class ApiClientError extends Error {
  readonly status: number;
  readonly body?: ApiError;

  constructor(message: string, status: number, body?: ApiError) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.body = body;
  }
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof ApiClientError) {
    return error.body?.message ?? error.message ?? fallback;
  }
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Cannot reach the server. Make sure the backend is running on port 8080 and CORS is enabled, then restart both apps.";
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
