import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import type { Language } from "../../types/enums";
import type { CategoryWithDishesResponse, DishResponse } from "../../types";
import type { RouteParams } from "../../types/routes";
import { ApiClientError } from "../../api/errors";
import {
  getFullMenu,
  getFullMenuBySlug,
  getMenusBySlug,
} from "../../services/menu.service";
import * as restaurantService from "../../services/restaurant.service";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import SocialFab from "../../components/public/SocialFab";
import RestaurantClosed from "../../components/public/RestaurantClosed";
import MenuPicker from "../../components/public/MenuPicker";
import { shouldRecordView } from "../../lib/view-tracker";
import { MENU_THEMES, DEFAULT_THEME } from "../../components/public/themes";
import {
  isCategoryVisible,
  isDishVisible,
  getDishText,
} from "../../utils/menu-display";
import "../../styles/public-menu.css";
import {
  loadLikedToday,
  pruneOldLikes,
  saveLikedToday,
} from "../../lib/likes-storage";
import { getMenuStrings } from "../../lib/constants/menu-strings";
import ReviewFab from "../../components/public/Reviewfab";

const ALL_ID = "all";
const STICKY_OFFSET_FALLBACK = 132;
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export default function PublicMenuPage() {
  const { slug } = useParams<RouteParams["PublicMenu"]>();
  const [searchParams] = useSearchParams();
  // NOTE: this is now a friendly key (e.g. "lunch-menu"), not a raw menu id.
  const menuKeyFromQr = searchParams.get("menu");
  const { toasts, showToast, removeToast } = useToast();

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const stickyRef = useRef<HTMLDivElement | null>(null);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(ALL_ID);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null,
  );
  const [selectedDish, setSelectedDish] = useState<DishResponse | null>(null);
  const [liked, setLiked] = useState<Set<string>>(() => {
    pruneOldLikes();
    return loadLikedToday();
  });
  const [likeLoading, setLikeLoading] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  // Always fetch the menu list now — we need it to resolve the friendly
  // key back to a real menu id, whether or not "?menu=" is present.
  const {
    data: menuList,
    isLoading: menuListLoading,
    error: menuListError,
  } = useQuery({
    queryKey: ["public-menu-list", slug],
    queryFn: () => getMenusBySlug(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const resolvedMenuId = useMemo(() => {
    if (!menuList) return null;
    if (menuKeyFromQr) {
      const match = menuList.find((m) => m.publicKey === menuKeyFromQr);
      return match?.id ?? null;
    }
    if (menuList.length === 1) return menuList[0].id;
    return null;
  }, [menuKeyFromQr, menuList]);

  const menuKeyNotFound = !!menuKeyFromQr && !!menuList && !resolvedMenuId;

  const {
    data: menu,
    isLoading: menuLoading,
    error: menuError,
  } = useQuery({
    queryKey: ["public-menu", slug, resolvedMenuId],
    queryFn: () =>
      resolvedMenuId ? getFullMenu(resolvedMenuId) : getFullMenuBySlug(slug!),
    enabled:
      !!slug &&
      !menuKeyNotFound &&
      (!!resolvedMenuId || (!!menuList && menuList.length <= 1)),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const showMenuPicker =
    !menuKeyFromQr && !menuListLoading && !!menuList && menuList.length > 1;

  const { data: restaurantBySlug } = useQuery({
    queryKey: ["restaurant-by-slug", slug],
    queryFn: () => restaurantService.getRestaurantBySlug(slug!),
    enabled: !!slug && showMenuPicker,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const isLoading =
    menuListLoading ||
    (!showMenuPicker && !menuKeyNotFound && menuLoading && !menu);
  const error = menuListError ?? menuError;

  useEffect(() => {
    if (!menu?.restaurantId) return;
    if (!shouldRecordView(menu.restaurantId)) return;
    fetch(`${API_BASE}/api/restaurants/${menu.restaurantId}/addView`, {
      method: "PATCH",
    }).catch(() => {});
  }, [menu?.restaurantId]);

  const availableLanguages = useMemo(() => {
    if (menu) return Object.keys(menu.translations) as Language[];
    if (menuList?.length) {
      const keys = new Set<string>();
      menuList.forEach((entry) =>
        Object.keys(entry.translations).forEach((key) => keys.add(key)),
      );
      return Array.from(keys) as Language[];
    }
    return [];
  }, [menu, menuList]);

  const language: Language | null = useMemo(() => {
    if (selectedLanguage && availableLanguages.includes(selectedLanguage)) {
      return selectedLanguage;
    }
    return availableLanguages[0] ?? null;
  }, [selectedLanguage, availableLanguages]);

  const t = getMenuStrings(language);

  const categoriesWithDishes = useMemo<CategoryWithDishesResponse[]>(() => {
    return (menu?.categories ?? [])
      .filter(isCategoryVisible)
      .map((category) => ({
        ...category,
        dishes: category.dishes.filter(isDishVisible),
      }))
      .filter((category) => category.dishes.length > 0);
  }, [menu]);

  const toggleLike = useCallback(
    async (dishId: string) => {
      if (likeLoading.has(dishId)) return;

      const wasLiked = liked.has(dishId);
      const endpoint = wasLiked ? "dislike" : "like";

      setLiked((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.delete(dishId);
        else next.add(dishId);
        saveLikedToday(next);
        return next;
      });

      setSelectedDish((prev) => {
        if (!prev || prev.id !== dishId) return prev;
        return {
          ...prev,
          likesCount: wasLiked
            ? Math.max(0, prev.likesCount - 1)
            : prev.likesCount + 1,
        };
      });

      setLikeLoading((prev) => new Set(prev).add(dishId));

      try {
        const res = await fetch(
          `${API_BASE}/api/dishes/${dishId}/${endpoint}`,
          {
            method: "PATCH",
          },
        );

        if (!res.ok) throw new Error("Request failed");

        const updated: DishResponse = await res.json();
        setSelectedDish((prev) => {
          if (!prev || prev.id !== dishId) return prev;
          return { ...prev, likesCount: updated.likesCount };
        });
      } catch {
        setLiked((prev) => {
          const next = new Set(prev);
          if (wasLiked) next.add(dishId);
          else next.delete(dishId);
          saveLikedToday(next);
          return next;
        });
        setSelectedDish((prev) => {
          if (!prev || prev.id !== dishId) return prev;
          return {
            ...prev,
            likesCount: wasLiked
              ? prev.likesCount + 1
              : Math.max(0, prev.likesCount - 1),
          };
        });
        showToast(
          "error",
          "Oops",
          "Could not save your like. Please try again.",
        );
      } finally {
        setLikeLoading((prev) => {
          const next = new Set(prev);
          next.delete(dishId);
          return next;
        });
      }
    },
    [liked, likeLoading, showToast],
  );

  const scrollToCategory = useCallback((id: string) => {
    setActiveCategoryId(id);

    if (id === ALL_ID) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = sectionRefs.current[id];
    if (!target) return;

    const offset = stickyRef.current?.offsetHeight ?? STICKY_OFFSET_FALLBACK;
    const top =
      target.getBoundingClientRect().top + window.scrollY - offset - 8;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (search.trim()) return;

    const handleScroll = () => {
      const offset =
        (stickyRef.current?.offsetHeight ?? STICKY_OFFSET_FALLBACK) + 16;

      for (let i = categoriesWithDishes.length - 1; i >= 0; i--) {
        const category = categoriesWithDishes[i];
        const el = sectionRefs.current[category.id];
        if (el && el.getBoundingClientRect().top <= offset) {
          setActiveCategoryId(category.id);
          return;
        }
      }
      setActiveCategoryId(ALL_ID);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categoriesWithDishes, search]);

  const searchResults = useMemo(() => {
    if (!search.trim() || !language) return null;

    const term = search.trim().toLowerCase();
    return categoriesWithDishes
      .flatMap((category) => category.dishes)
      .filter((dish) => {
        const { name, description } = getDishText(dish, language);
        return (
          name.toLowerCase().includes(term) ||
          (description ?? "").toLowerCase().includes(term)
        );
      });
  }, [search, categoriesWithDishes, language]);

  const isClosed = error instanceof ApiClientError && error.status === 403;

  if (isClosed) return <RestaurantClosed language={language} />;

  const showMenuPickerView =
    showMenuPicker && !menuListLoading && !menuListError;

  if (showMenuPickerView && menuList) {
    const pickerRestaurant = restaurantBySlug
      ? {
          name: restaurantBySlug.name,
          logoUrl: restaurantBySlug.logoUrl,
          ville: restaurantBySlug.ville,
          address: restaurantBySlug.address,
        }
      : menu?.restaurant;

    return (
      <MenuPicker
        slug={slug!}
        menus={menuList}
        restaurant={pickerRestaurant}
        language={language}
        onLanguageChange={setSelectedLanguage}
      />
    );
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--menu-bg)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-(--menu-accent) border-t-transparent animate-spin" />
          <p className="text-sm text-(--menu-muted)">{t.loading}</p>
        </div>
      </div>
    );
  }

  if ((error && !isClosed) || menuKeyNotFound) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "var(--menu-bg)" }}
      >
        <p className="text-base text-(--menu-muted) text-center">
          {t.notFound}
        </p>
      </div>
    );
  }

  if (!menu || !language) return null;

  const menuTitle =
    menu.translations[language]?.title ??
    Object.values(menu.translations)[0]?.title ??
    "";

  const banners = (menu.restaurant.banners ?? []).filter((b) => b.visible);

  const themeKey = menu.theme ?? DEFAULT_THEME;

  const ThemeLayout = MENU_THEMES[themeKey] ?? MENU_THEMES[DEFAULT_THEME];

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <ThemeLayout
        menu={menu}
        menuTitle={menuTitle}
        banners={banners}
        categoriesWithDishes={categoriesWithDishes}
        language={language}
        availableLanguages={availableLanguages}
        onLanguageChange={setSelectedLanguage}
        liked={liked}
        onLike={toggleLike}
        selectedDish={selectedDish}
        onSelectDish={setSelectedDish}
        search={search}
        onSearchChange={setSearch}
        searchResults={searchResults}
        activeCategoryId={activeCategoryId}
        onCategorySelect={scrollToCategory}
        allId={ALL_ID}
        sectionRefs={sectionRefs}
        stickyRef={stickyRef}
        t={t}
      />

      <SocialFab restaurant={menu.restaurant} />
      <ReviewFab restaurant={menu.restaurant} language={language} />
    </>
  );
}