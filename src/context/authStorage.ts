import * as menuService from "../services/menu.service";
import * as restaurantService from "../services/restaurant.service";
import type { Role } from "../types";

export const STORAGE_KEY = "qr_menu_auth";

export interface StoredAuth {
  token: string;
  email: string;
  role: Role;
  restaurantId: string;
  menuId: string | null;
}

export function readStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function writeStoredAuth(auth: StoredAuth | null) {
  if (!auth) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("auth_token");
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  localStorage.setItem("auth_token", auth.token);
}

export async function resolveMenuId(
  restaurantId: string,
  currentMenuId: string | null
) {
  const restaurant = await restaurantService.getRestaurant(restaurantId);
  if (restaurant.defaultMenuId) return restaurant.defaultMenuId;
  if (currentMenuId) return currentMenuId;
  const menus = await menuService.getMenusByRestaurant(restaurantId);
  return menus[0]?.id ?? null;
}