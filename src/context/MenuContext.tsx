import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import * as menuService from "../services/menu.service";
import * as restaurantService from "../services/restaurant.service";
import type { MenuResponse } from "../types";

interface MenuContextValue {
  menus: MenuResponse[];
  currentMenuId: string | null;
  currentMenu: MenuResponse | null;
  defaultMenuId: string | null;
  isLoading: boolean;
  isError: boolean;
  switchMenu: (menuId: string) => void;
  refetchMenus: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function storageKey(restaurantId: string) {
  return `qr_menu_active_menu_${restaurantId}`;
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const { restaurantId } = useAuth();
  const queryClient = useQueryClient();
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);

  const {
    data: menus = [],
    isLoading: menusLoading,
    isError: menusError,
    refetch: refetchMenusQuery,
  } = useQuery({
    queryKey: ["menus", restaurantId],
    queryFn: () => menuService.getMenusByRestaurant(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 1000 * 30,
  });

  const { data: restaurant } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => restaurantService.getRestaurant(restaurantId!),
    enabled: !!restaurantId,
    staleTime: Infinity,
  });

  const defaultMenuId = restaurant?.defaultMenuId ?? null;

  // Resolve/repair the active menu whenever the menu list changes
  // (covers first load, and the active menu being deleted elsewhere)
  useEffect(() => {
    if (!restaurantId || menus.length === 0) return;

    const stored = localStorage.getItem(storageKey(restaurantId));
    const storedIsValid = stored && menus.some((m) => m.id === stored);
    if (storedIsValid) {
      setCurrentMenuId(stored);
      return;
    }

    const fallback =
      defaultMenuId && menus.some((m) => m.id === defaultMenuId)
        ? defaultMenuId
        : menus[0].id;

    setCurrentMenuId(fallback);
    localStorage.setItem(storageKey(restaurantId), fallback);
  }, [restaurantId, menus, defaultMenuId]);

  const switchMenu = (menuId: string) => {
    if (!restaurantId) return;
    setCurrentMenuId(menuId);
    localStorage.setItem(storageKey(restaurantId), menuId);
  };

  const refetchMenus = () => {
    refetchMenusQuery();
    queryClient.invalidateQueries({ queryKey: ["restaurant", restaurantId] });
  };

  const currentMenu = useMemo(
    () => menus.find((m) => m.id === currentMenuId) ?? null,
    [menus, currentMenuId],
  );

  const value: MenuContextValue = {
    menus,
    currentMenuId,
    currentMenu,
    defaultMenuId,
    isLoading: menusLoading,
    isError: menusError,
    switchMenu,
    refetchMenus,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
}