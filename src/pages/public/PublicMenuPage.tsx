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
import HeroCarousel from "../../components/public/HeroCarousel";
import RestaurantHeader from "../../components/public/RestaurantHeader";
import SearchBar from "../../components/public/SearchBar";
import CategoryFilter from "../../components/public/CategoryFilter";
import DishCard from "../../components/public/DishCard";
import DishModal from "../../components/public/DishModal";
import EmptyCategory from "../../components/public/EmptyCategory";
import RestaurantInfoCard from "../../components/public/RestaurantInfoCard";
import SocialFab from "../../components/public/SocialFab";
import Footer from "../../components/public/Footer";
import RestaurantClosed from "../../components/public/RestaurantClosed";
import MenuPicker from "../../components/public/MenuPicker";
import { shouldRecordView } from "../../lib/view-tracker";
import CustomMenuLayout from "../../components/public/CustomMenuLayout";
import {
  getCategoryName,
  getDishText,
  isCategoryVisible,
  isDishVisible,
  isRTL,
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
  const { data: menuList, isLoading: menuListLoading, error: menuListError } = useQuery({
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

  // A "?menu=" was present, the menu list loaded, but nothing matched —
  // stale/mistyped link, not a loading state.
  const menuKeyNotFound =
    !!menuKeyFromQr && !!menuList && !resolvedMenuId;

  const {
    data: menu,
    isLoading: menuLoading,
    error: menuError,
  } = useQuery({
    queryKey: ["public-menu", slug, resolvedMenuId],
    queryFn: () =>
      resolvedMenuId
        ? getFullMenu(resolvedMenuId)
        : getFullMenuBySlug(slug!),
    enabled:
      !!slug &&
      !menuKeyNotFound &&
      (!!resolvedMenuId || (!!menuList && menuList.length <= 1)),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const showMenuPicker =
    !menuKeyFromQr &&
    !menuListLoading &&
    !!menuList &&
    menuList.length > 1;

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
    if (!menu?.id) return;
    if (!shouldRecordView(menu.id)) return;
    fetch(`${API_BASE}/api/menus/${menu.id}/addView`, {
      method: "PATCH",
    }).catch(() => {});
  }, [menu?.id]);

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

  const CUSTOM_LAYOUT_SLUG = "le-916";

  if (slug === CUSTOM_LAYOUT_SLUG) {
    return (
      <CustomMenuLayout
        menu={menu}
        language={language}
        availableLanguages={availableLanguages}
        onLanguageChange={setSelectedLanguage}
        liked={liked}
        onLike={toggleLike}
        t={t}
      />
    );
  }
  const menuTitle =
    menu.translations[language]?.title ??
    Object.values(menu.translations)[0]?.title ??
    "";

  const banners = (menu.restaurant.banners ?? []).filter((b) => b.visible);

  return (
    <div
      dir={isRTL(language) ? "rtl" : "ltr"}
      className="min-h-screen"
      style={{
        background: "var(--menu-bg)",
        fontFamily: '"Nunito", system-ui, sans-serif',
      }}
    >
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {selectedDish && (
        <DishModal
          dish={selectedDish}
          devise={menu.devise}
          language={language}
          liked={liked.has(selectedDish.id)}
          onLike={() => toggleLike(selectedDish.id)}
          onClose={() => setSelectedDish(null)}
          t={t}
        />
      )}
      <div className="w-full sm:max-w-2xl lg:max-w-5xl mx-auto px-4 pb-24">
        {banners.length > 0 && (
          <div className="pt-4">
            <HeroCarousel banners={banners} />
          </div>
        )}

        <div className="pt-5 pb-4">
          <RestaurantHeader
            restaurant={menu.restaurant}
            menuTitle={menuTitle}
            availableLanguages={availableLanguages}
            selectedLanguage={language}
            onLanguageChange={setSelectedLanguage}
          />
        </div>

        <div
          ref={stickyRef}
          className="sticky top-0 z-20 -mx-4 px-4 py-3 border-b border-(--menu-border)"
          style={{ background: "var(--menu-bg)" }}
        >
          <div className="mb-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={t.searchPlaceholder}
            />
          </div>
          {!search && (
            <CategoryFilter
              categories={categoriesWithDishes}
              activeCategoryId={activeCategoryId}
              language={language}
              onSelect={scrollToCategory}
              allId={ALL_ID}
              t={t}
            />
          )}
        </div>

        {searchResults !== null ? (
          <div className="pt-4">
            <p className="text-xs text-(--menu-muted) mb-3">
              {t.searchResults(searchResults.length, search)}
            </p>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {searchResults.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    devise={menu.devise}
                    language={language}
                    liked={liked.has(dish.id)}
                    onLike={() => toggleLike(dish.id)}
                    onClick={() => setSelectedDish(dish)}
                    t={t}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-base font-semibold text-(--menu-primary) menu-font-display">
                  {t.noResults}
                </p>
                <p className="text-xs text-(--menu-muted) mt-1">
                  {t.noResultsHint}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 pt-6">
              {categoriesWithDishes.map((category) => {
                const catLabel = getCategoryName(category, language);

                return (
                  <section
                    key={category.id}
                    ref={(el) => {
                      sectionRefs.current[category.id] = el;
                    }}
                    style={{ scrollMarginTop: STICKY_OFFSET_FALLBACK + 8 }}
                    className="pb-4"
                  >
                    <h2 className="text-lg font-bold text-(--menu-primary) mb-3 menu-font-display">
                      {catLabel}
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {category.dishes.map((dish) => (
                        <DishCard
                          key={dish.id}
                          dish={dish}
                          devise={menu.devise}
                          language={language}
                          liked={liked.has(dish.id)}
                          onLike={() => toggleLike(dish.id)}
                          onClick={() => setSelectedDish(dish)}
                          t={t}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

              {categoriesWithDishes.length === 0 && (
                <EmptyCategory
                  title={t.noItemsTitle}
                  message={t.noDishes}
                  hint={t.noItemsHint}
                />
              )}
            </div>

            <div className="my-6 border-t border-(--menu-border)" />

            <RestaurantInfoCard restaurant={menu.restaurant} showMap={true} />

            <Footer restaurant={menu.restaurant} language={language} />
          </>
        )}
      </div>

      <SocialFab restaurant={menu.restaurant} />

      <ReviewFab restaurant={menu.restaurant} language={language} />
    </div>
  );
}