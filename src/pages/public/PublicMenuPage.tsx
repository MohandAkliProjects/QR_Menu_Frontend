import { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import type { Language } from "../../types/enums";
import type { CategoryWithDishesResponse, DishResponse } from "../../types";
import type { RouteParams } from "../../types/routes";
import { ApiClientError } from "../../api/errors";
import { getFullMenuBySlug } from "../../services/menu.service";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ui/ToastContainer";
import BannerCarousel from "../../components/public/BannerCarousel";
import MenuHeader from "../../components/public/MenuHeader";
import CategoryNav from "../../components/public/CategoryNav";
import DishCard from "../../components/public/DishCard";
import DishModal from "../../components/public/DishModal";
import SocialLinks from "../../components/public/SocialLinks";
import RestaurantClosed from "../../components/public/RestaurantClosed";

const ALL_ID = "all";

export default function PublicMenuPage() {
  const { menuId: slug } = useParams<RouteParams["PublicMenu"]>();
  const { toasts, showToast, removeToast } = useToast();
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeCategoryId, setActiveCategoryId] = useState<string>(ALL_ID);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [selectedDish, setSelectedDish] = useState<DishResponse | null>(null);

  const { data: menu, isLoading, error } = useQuery({
    queryKey: ["public-menu", slug],
    queryFn: () => getFullMenuBySlug(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

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

  const categoriesWithDishes = useMemo(
    () => (menu?.categories ?? []).filter((c) => c.dishes.length > 0),
    [menu],
  );

  const scrollToCategory = useCallback((id: string) => {
    setActiveCategoryId(id);
    if (id === ALL_ID) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleLike = useCallback(() => {
    showToast("success", "Coming Soon", "Likes will be available soon!");
  }, [showToast]);

  const isClosed = error instanceof ApiClientError && error.status === 403;

  if (isClosed) return <RestaurantClosed />;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-tertiary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary-700 border-t-transparent animate-spin" />
          <p className="text-sm text-text-400">Loading menu…</p>
        </div>
      </div>
    );
  }

  if (error && !isClosed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background-tertiary">
        <p className="text-base text-text-400 text-center">
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

  const categoriesToShow =
    activeCategoryId === ALL_ID
      ? categoriesWithDishes
      : categoriesWithDishes.filter((c) => c.id === activeCategoryId);

  return (
    <div className="min-h-screen bg-background-tertiary">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {selectedDish && (
        <DishModal
          dish={selectedDish}
          devise={menu.devise}
          language={language}
          onClose={() => setSelectedDish(null)}
          onLike={handleLike}
        />
      )}

      <SocialLinks restaurant={menu.restaurant} />

      <div className="w-full sm:max-w-2xl lg:max-w-5xl mx-auto px-4 pb-24">

        {menu.restaurant.banners && menu.restaurant.banners.length > 0 && (
          <div className="pt-4">
            <BannerCarousel banners={menu.restaurant.banners} />
          </div>
        )}

        <div className="pt-5 pb-4">
          <MenuHeader
            restaurant={menu.restaurant}
            menuTitle={menuTitle}
            availableLanguages={availableLanguages}
            selectedLanguage={language}
            onLanguageChange={setSelectedLanguage}
          />
        </div>

        <div className="sticky top-0 z-10 bg-background-tertiary py-3 -mx-4 px-4 border-b border-border-tertiary">
          <CategoryNav
            categories={categoriesWithDishes}
            activeCategoryId={activeCategoryId}
            language={language}
            onSelect={scrollToCategory}
            allId={ALL_ID}
          />
        </div>

        <div className="flex flex-col gap-8 pt-6">
          {categoriesToShow.map((category: CategoryWithDishesResponse) => {
            const catLabel =
              category.translations[language]?.name ??
              Object.values(category.translations)[0]?.name ??
              "—";

            return (
              <section
                key={category.id}
                id={category.id}
                ref={(el) => { sectionRefs.current[category.id] = el; }}
              >
                <h2 className="text-lg font-bold text-dark-800 mb-3">{catLabel}</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {category.dishes.map((dish: DishResponse) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      devise={menu.devise}
                      language={language}
                      onLike={handleLike}
                      onClick={() => setSelectedDish(dish)}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {categoriesToShow.length === 0 && (
            <p className="text-center text-sm text-text-400 py-10">
              No dishes available in this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}