import { apiRequest } from "../api/client";
import type { ThemeResponse, UpdateMenuThemeRequest, MenuResponse } from "../types";

export async function getActiveThemes(): Promise<ThemeResponse[]> {
  return apiRequest<ThemeResponse[]>("/api/themes", { auth: false });
}

export async function updateMenuTheme(
  restaurantId: string,
  data: UpdateMenuThemeRequest,
): Promise<MenuResponse> {
  return apiRequest<MenuResponse>(
    `/api/menus/theme/restaurant/${restaurantId}`,
    { method: "PATCH", body: data },
  );
}