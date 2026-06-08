import { apiRequest } from "../api/client";
import type { AuthResponse, LoginRequest, LogoutResponse } from "../types";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  role: string;
  restaurantId?: string;
}

export async function loginRestaurant(credentials: LoginRequest): Promise<AuthResponse> {
  const raw = await apiRequest<{ token: string }>("/api/auth/login", {
    method: "POST",
    body: credentials,
    auth: false,
  });

  const decoded = jwtDecode<JwtPayload>(raw.token);

  return {
    token: raw.token,
    email: decoded.sub,
    role: decoded.role as AuthResponse["role"],
    restaurantId: decoded.restaurantId ?? "",
  };
}

export async function logout(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>("/api/auth/logout", { method: "POST" });
}