import { apiRequest } from "../api/client";
import type { AuthResponse, LoginRequest, LogoutResponse } from "../types";

export async function loginRestaurant(credentials: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/restaurant/login", {
    method: "POST",
    body: credentials,
    auth: false,
  });
}

export async function logout(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>("/api/auth/logout", { method: "POST" });
}
