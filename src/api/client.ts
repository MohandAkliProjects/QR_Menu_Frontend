import { ApiClientError } from "./errors";
import type { ApiError } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

async function parseError(res: Response): Promise<ApiClientError> {
  let body: ApiError | undefined;
  try {
    body = (await res.json()) as ApiError;
  } catch {
    // ignore non-json bodies
  }
  return new ApiClientError(
    body?.message ?? `Request failed (${res.status})`,
    res.status,
    body
  );
}

export async function apiRequest<T>(
  path: string,
  { body, auth = true, headers, ...init }: RequestOptions = {}
): Promise<T> {
  const requestHeaders = new Headers(headers);

  if (auth) {
    const token = getToken();
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: requestHeaders,
    body: requestBody,
  });

  if (!res.ok) throw await parseError(res);

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export { BASE_URL };
