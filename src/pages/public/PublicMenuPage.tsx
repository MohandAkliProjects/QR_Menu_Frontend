import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import type { Language } from "../../types/enums";
import type { CategoryWithDishesResponse, DishResponse } from "../../types";
import type { RouteParams } from "../../types/routes";
import { ApiClientError } from "../../api/errors";
import { getFullMenuBySlug } from "../../services/menu.service";
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
import { shouldRecordView } from "../../lib/view-tracker";
import {
  getCategoryName,
  getDishText,
  isCategoryVisible,
  isDishVisible,
  isRTL,
} from "../../utils/menu-display";
import "../../styles/public-menu.css";
import { loadLikedToday, pruneOldLikes, saveLikedToday } from "../../lib/likes-storage";

const ALL_ID = "all";
/** Fallback height for the sticky search/category bar before it's measured. */
const STICKY_OFFSET_FALLBACK = 132;

/** Base URL for all API calls — adjust to match your env config. */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export default function PublicMenuPage() {
  const { menuId: slug } = useParams<RouteParams["PublicMenu"]>();
  const { toasts, showToast, removeToast } = useToast();

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const stickyRef = useRef<HTMLDivElement | null>(null);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(ALL_ID);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [selectedDish, setSelectedDish] = useState<DishResponse | null>(null);
  // liked: Set of dish ids toggled on by this visitor in this session
 const [liked, setLiked] = useState<Set<string>>(() => {
  pruneOldLikes();
  return loadLikedToday();
});
  // likeLoading: tracks in-flight like/dislike requests to prevent double-taps
  const [likeLoading, setLikeLoading] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const { data: menu, isLoading, error } = useQuery({
    queryKey: ["public-menu", slug],
    queryFn: () => getFullMenuBySlug(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
//effects 
useEffect(() => {
  if (!menu?.id) return;
  if (!shouldRecordView(menu.id)) return; // ← skip if already viewed today

  fetch(`${API_BASE}/api/menus/${menu.id}/addView`, { method: "PATCH" }).catch(() => {});
}, [menu?.id]);
  const availableLanguages = useMemo(
    () => (menu ? (Object.keys(menu.translations) as Language[]) : []),
    [menu],
  );

  const language: Language | null = useMemo(() => {
    if (selectedLanguage && availableLanguages.includes(selectedLanguage)) {
      return selectedLanguage;
    }
    return availableLanguages[0] ?? null;
  }, [selectedLanguage, availableLanguages]);

  // Only visible categories, with only their visible dishes, dropping any
  // category left with nothing to show.
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

    // Optimistic update + persist
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
        likesCount: wasLiked ? Math.max(0, prev.likesCount - 1) : prev.likesCount + 1,
      };
    });

    setLikeLoading((prev) => new Set(prev).add(dishId));

    try {
      const res = await fetch(`${API_BASE}/api/dishes/${dishId}/${endpoint}`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Request failed");

      const updated: DishResponse = await res.json();
      setSelectedDish((prev) => {
        if (!prev || prev.id !== dishId) return prev;
        return { ...prev, likesCount: updated.likesCount };
      });
    } catch {
      // Roll back optimistic update + persist rollback
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
          likesCount: wasLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1),
        };
      });
      showToast("error", "Oops", "Could not save your like. Please try again.");
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
    const top = target.getBoundingClientRect().top + window.scrollY - offset - 8;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  // Scroll-spy: highlight whichever category section is currently under the
  // sticky bar. Disabled while searching, since the category strip is hidden.
  useEffect(() => {
    if (search.trim()) return;

    const handleScroll = () => {
      const offset = (stickyRef.current?.offsetHeight ?? STICKY_OFFSET_FALLBACK) + 16;

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

  if (isClosed) return <RestaurantClosed />;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--menu-bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--menu-accent)] border-t-transparent animate-spin" />
          <p className="text-sm text-[var(--menu-muted)]">Loading menu…</p>
        </div>
      </div>
    );
  }

  if (error && !isClosed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--menu-bg)" }}>
        <p className="text-base text-[var(--menu-muted)] text-center">
          Menu not found or unavailable.
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

  return (
    <div
      dir={isRTL(language) ? "rtl" : "ltr"}
      className="min-h-screen"
      style={{ background: "var(--menu-bg)", fontFamily: '"Nunito", system-ui, sans-serif' }}
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
          className="sticky top-0 z-20 -mx-4 px-4 py-3 border-b border-[var(--menu-border)]"
          style={{ background: "var(--menu-bg)" }}
        >
          <div className="mb-3">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          {!search && (
            <CategoryFilter
              categories={categoriesWithDishes}
              activeCategoryId={activeCategoryId}
              language={language}
              onSelect={scrollToCategory}
              allId={ALL_ID}
            />
          )}
        </div>

        {searchResults !== null ? (
          <div className="pt-4">
            <p className="text-xs text-[var(--menu-muted)] mb-3">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
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
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-base font-semibold text-[var(--menu-primary)] menu-font-display">
                  No results found
                </p>
                <p className="text-xs text-[var(--menu-muted)] mt-1">Try a different search term</p>
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
                    ref={(el) => { sectionRefs.current[category.id] = el; }}
                    style={{ scrollMarginTop: STICKY_OFFSET_FALLBACK + 8 }}
                    className="pb-4"
                  >
                    <h2 className="text-lg font-bold text-[var(--menu-primary)] mb-3 menu-font-display">
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
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

              {categoriesWithDishes.length === 0 && (
                <EmptyCategory message="No dishes available at the moment." />
              )}
            </div>

            <div className="my-6 border-t border-[var(--menu-border)]" />

            <RestaurantInfoCard restaurant={menu.restaurant} />

            <Footer restaurant={menu.restaurant} />
          </>
        )}
      </div>

      <SocialFab restaurant={menu.restaurant} />
    </div>
  );
}