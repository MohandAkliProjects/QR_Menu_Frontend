import { apiRequest } from "../api/client";
import type {
  FullMenuResponse,
  MenuResponse,
  UpdateMenuRequest,
} from "../types";

export async function getMenusByRestaurant(
  restaurantId: string
): Promise<MenuResponse[]> {
  return apiRequest<MenuResponse[]>(`/api/menus/restaurant/${restaurantId}`);
}

export async function getMenuById(
  restaurantId: string,
  menuId: string
): Promise<MenuResponse | null> {
  const menus = await getMenusByRestaurant(restaurantId);
  return menus.find((menu) => menu.id === menuId) ?? null;
}

export async function updateMenu(
  restaurantId: string,
  menuId: string,
  data: UpdateMenuRequest
): Promise<MenuResponse> {
  return apiRequest<MenuResponse>(
    `/api/menus/${menuId}/restaurant/${restaurantId}`,
    { method: "PUT", body: data }
  );
}

export async function deleteMenu(menuId: string): Promise<void> {
  return apiRequest<void>(`/api/menus/${menuId}`, { method: "DELETE" });
}

export async function getFullMenu(menuId: string): Promise<FullMenuResponse> {
  return apiRequest<FullMenuResponse>(`/api/menus/${menuId}/full`, {
    auth: false,
  });
}

export function sumMenuLikes(fullMenu: FullMenuResponse): number {
  return fullMenu.categories.reduce(
    (total, cat) =>
      total +
      cat.dishes.reduce((dishTotal, dish) => dishTotal + (dish.likes ?? 0), 0),
    0
  );
}