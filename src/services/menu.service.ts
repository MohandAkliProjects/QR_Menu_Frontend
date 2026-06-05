import { apiRequest } from "../api/client";
import type { MenuResponse } from "../types";

export async function getMenusByRestaurant(restaurantId: string): Promise<MenuResponse[]> {
  return apiRequest<MenuResponse[]>(`/api/menus/restaurant/${restaurantId}`);
}
