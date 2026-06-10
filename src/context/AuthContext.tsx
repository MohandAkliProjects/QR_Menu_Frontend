import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authService from "../services/auth.service";
import * as menuService from "../services/menu.service";
import * as restaurantService from "../services/restaurant.service";
import type { Role } from "../types";

const STORAGE_KEY = "qr_menu_auth";

interface StoredAuth {
  token: string;
  email: string;
  role: Role;
  restaurantId: string;
  menuId: string | null;
}

interface AuthContextValue {
  token: string | null;
  email: string | null;
  role: Role | null;
  restaurantId: string | null;
  menuId: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

function writeStoredAuth(auth: StoredAuth | null) {
  if (!auth) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("auth_token");
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  localStorage.setItem("auth_token", auth.token);
}

async function resolveMenuId(
  restaurantId: string,
  currentMenuId: string | null,
) {
  const restaurant = await restaurantService.getRestaurant(restaurantId);
  if (restaurant.defaultMenuId) return restaurant.defaultMenuId;

  if (currentMenuId) return currentMenuId;

  const menus = await menuService.getMenusByRestaurant(restaurantId);
  return menus[0]?.id ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(readStoredAuth);
  const [isBootstrapping, setIsBootstrapping] = useState(
    Boolean(readStoredAuth()),
  );

  const refreshSession = useCallback(async () => {
    if (!auth?.token || !auth.restaurantId) return;

    const menuId = await resolveMenuId(auth.restaurantId, auth.menuId);
    const next = { ...auth, menuId };
    setAuth(next);
    writeStoredAuth(next);
  }, [auth]);

  useEffect(() => {
    if (!auth?.token) {
      return;
    }

    let cancelled = false;

    (async () => {
      if (!auth?.token) {
        if (!cancelled) setIsBootstrapping(false);
        return;
      }

      try {
        const menuId = await resolveMenuId(auth.restaurantId, auth.menuId);
        if (cancelled) return;
        const next = { ...auth, menuId };
        setAuth(next);
        writeStoredAuth(next);
      } catch {
        if (!cancelled) {
          setAuth(null);
          writeStoredAuth(null);
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    writeStoredAuth(null);

    const response = await authService.loginRestaurant({ email, password });
    if (!response.restaurantId) {
      throw new Error("Restaurant account is missing a restaurant id.");
    }

    const base: StoredAuth = {
      token: response.token,
      email: response.email,
      role: response.role,
      restaurantId: response.restaurantId,
      menuId: null,
    };

    localStorage.setItem("auth_token", response.token);

    const menuId = await resolveMenuId(response.restaurantId, null);
    const next = { ...base, menuId };
    setAuth(next);
    writeStoredAuth(next);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // still clear local session
    }
    setAuth(null);
    writeStoredAuth(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: auth?.token ?? null,
      email: auth?.email ?? null,
      role: auth?.role ?? null,
      restaurantId: auth?.restaurantId ?? null,
      menuId: auth?.menuId ?? null,
      isAuthenticated: Boolean(auth?.token),
      isBootstrapping,
      login,
      logout,
      refreshSession,
    }),
    [auth, isBootstrapping, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
