import { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";

import type {
  CategoryWithDishesResponse,
  DishResponse,
  FullMenuResponse,
  SupplementResponse,
} from "../../types/api";
import type { Language } from "../../types/enums";
import {
  formatPrice,
  getCategoryName,
  getDishText,
  isDishAvailable,
  isRTL,
} from "../../utils/menu-display";
import type { MenuStrings } from "../../lib/constants/menu-strings";

import HeroCarousel from "./HeroCarousel";
import SocialLinksBar from "./SocialLinksBar";
import ReviewFab from "./Reviewfab";
import Footer from "./Footer";
import DishCard from "./DishCard";
import EmptyCategory from "./EmptyCategory";
import Button from "../ui/Button";

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "EN",
  fr: "FR",
  ar: "AR",
};

const SUPPLEMENTS_LABEL: Record<Language, string> = {
  en: "Add-ons",
  fr: "Suppléments",
  ar: "الإضافات",
};

const SIZES_LABEL: Record<Language, string> = {
  en: "Sizes",
  fr: "Tailles",
  ar: "الأحجام",
};

const BACK_LABEL: Record<Language, string> = {
  en: "Back",
  fr: "Retour",
  ar: "رجوع",
};

function getSupplementName(
  supplement: SupplementResponse,
  language: Language,
): string {
  return (
    supplement.translations[language]?.name ??
    Object.values(supplement.translations)[0]?.name ??
    ""
  );
}

interface CustomMenuLayoutProps {
  menu: FullMenuResponse;
  language: Language;
  availableLanguages: Language[];
  onLanguageChange: (language: Language) => void;
  liked: Set<string>;
  onLike: (dishId: string) => void;
  t: MenuStrings;
}

function CategoryTile({
  category,
  language,
  onClick,
}: {
  category: CategoryWithDishesResponse;
  language: Language;
  onClick: () => void;
}) {
  const label = getCategoryName(category, language);
  const hasImage = !!category.iconUrl;

  return (
    <button
      onClick={onClick}
      className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform"
      style={{ background: "var(--menu-secondary)" }}
    >
      {hasImage ? (
        <img
          src={category.iconUrl}
          alt={label}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center text-4xl font-bold"
          style={{ background: "var(--menu-accent)", color: "#fff" }}
        >
          {label.charAt(0).toUpperCase()}
        </div>
      )}
      <div
        className="absolute inset-0 flex items-end p-3"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0) 60%)",
        }}
      >
        <span className="text-white font-bold text-base menu-font-display text-left">
          {label}
        </span>
      </div>
    </button>
  );
}

function resolveFromSearchParams(
  menu: FullMenuResponse,
  params: URLSearchParams,
): {
  category: CategoryWithDishesResponse | null;
  dish: DishResponse | null;
} {
  const categoryId = params.get("category");
  const dishId = params.get("dish");

  const category = menu.categories.find((c) => c.id === categoryId) ?? null;

  const dish =
    category && dishId
      ? (category.dishes.find((d) => d.id === dishId) ?? null)
      : null;

  return { category, dish };
}

export default function CustomMenuLayout({
  menu,
  language,
  availableLanguages,
  onLanguageChange,
  liked,
  onLike,
  t,
}: CustomMenuLayoutProps) {
  const [activeCategory, setActiveCategory] =
    useState<CategoryWithDishesResponse | null>(() => {
      if (typeof window === "undefined") return null;
      return resolveFromSearchParams(
        menu,
        new URLSearchParams(window.location.search),
      ).category;
    });
  const [selectedDish, setSelectedDish] = useState<DishResponse | null>(() => {
    if (typeof window === "undefined") return null;
    return resolveFromSearchParams(
      menu,
      new URLSearchParams(window.location.search),
    ).dish;
  });

  const menuTitle =
    menu.translations[language]?.title ??
    Object.values(menu.translations)[0]?.title ??
    "";

  const banners = (menu.restaurant.banners ?? []).filter((b) => b.visible);

  useEffect(() => {
    const handlePopState = () => {
      const { category, dish } = resolveFromSearchParams(
        menu,
        new URLSearchParams(window.location.search),
      );
      setActiveCategory(category);
      setSelectedDish(dish);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [menu]);

  function buildUrl(categoryId: string | null, dishId: string | null) {
    const params = new URLSearchParams(window.location.search);
    if (categoryId) params.set("category", categoryId);
    else params.delete("category");
    if (dishId) params.set("dish", dishId);
    else params.delete("dish");
    const query = params.toString();
    return query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;
  }

  function openCategory(category: CategoryWithDishesResponse) {
    window.history.pushState(
      { menuView: "category" },
      "",
      buildUrl(category.id, null),
    );
    setActiveCategory(category);
    setSelectedDish(null);
  }

  function closeCategory() {
    if (window.history.state?.menuView === "category") {
      window.history.back();
    } else {
      window.history.replaceState({}, "", buildUrl(null, null));
      setActiveCategory(null);
    }
  }

  function openDish(dish: DishResponse) {
    if (!activeCategory) return;
    window.history.pushState(
      { menuView: "dish" },
      "",
      buildUrl(activeCategory.id, dish.id),
    );
    setSelectedDish(dish);
  }

  function closeDish() {
    if (window.history.state?.menuView === "dish") {
      window.history.back();
    } else if (activeCategory) {
      window.history.replaceState({}, "", buildUrl(activeCategory.id, null));
      setSelectedDish(null);
    }
  }

  return (
    <div
      dir={isRTL(language) ? "rtl" : "ltr"}
      className="min-h-screen"
      style={{
        background: "var(--menu-bg)",
        fontFamily: '"Nunito", system-ui, sans-serif',
      }}
    >
      {/* FULL SCREEN DISH VIEW */}
      {selectedDish && (
        <FullScreenDish
          key={selectedDish.id}
          dish={selectedDish}
          devise={menu.devise}
          language={language}
          liked={liked.has(selectedDish.id)}
          onLike={() => onLike(selectedDish.id)}
          onClose={closeDish}
          t={t}
        />
      )}

      <div className="w-full sm:max-w-2xl lg:max-w-5xl mx-auto px-4 pb-24">
        {banners.length > 0 && (
          <div className="pt-4">
            <HeroCarousel banners={banners} />
          </div>
        )}

        {/* Big centered restaurant identity */}
        <div className="pt-6 pb-4 flex flex-col items-center text-center">
          {menu.restaurant.logoUrl ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-(--menu-border) shadow-sm bg-(--menu-card) mb-3">
              <img
                src={menu.restaurant.logoUrl}
                alt={menu.restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-(--menu-border) shadow-sm bg-(--menu-secondary) flex items-center justify-center mb-3">
              <span className="text-2xl sm:text-3xl font-bold text-(--menu-primary) menu-font-display">
                {menu.restaurant.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {menuTitle && (
            <p className="text-[10px] font-bold tracking-[0.2em] text-(--menu-accent) uppercase mb-1">
              {menuTitle}
            </p>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-(--menu-primary) menu-font-display leading-tight">
            {menu.restaurant.name}
          </h1>

          {(menu.restaurant.address || menu.restaurant.ville) && (
            <p className="text-sm text-(--menu-muted) mt-1">
              {menu.restaurant.address || menu.restaurant.ville}
            </p>
          )}

          {availableLanguages.length > 1 && (
            <div className="flex gap-1.5 mt-3">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    lang === language
                      ? "bg-(--menu-primary) text-white"
                      : "bg-(--menu-secondary) text-(--menu-primary)"
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CATEGORY GRID or DISH LIST - swaps in place, same page */}
        {activeCategory === null ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {menu.categories.map((category) => (
              <CategoryTile
                key={category.id}
                category={category}
                language={language}
                onClick={() => openCategory(category)}
              />
            ))}
          </div>
        ) : (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={closeCategory}
                className="text-xl leading-none px-1"
                style={{ color: "var(--menu-primary)" }}
                aria-label={BACK_LABEL[language]}
              >
                {isRTL(language) ? "→" : "←"}
              </button>
              <h2 className="text-lg font-bold text-(--menu-primary) menu-font-display">
                {getCategoryName(activeCategory, language)}
              </h2>
            </div>

            {activeCategory.dishes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {activeCategory.dishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    devise={menu.devise}
                    language={language}
                    liked={liked.has(dish.id)}
                    onLike={() => onLike(dish.id)}
                    onClick={() => openDish(dish)}
                    t={t}
                  />
                ))}
              </div>
            ) : (
              <EmptyCategory
                title={t.noItemsTitle}
                message={t.noDishes}
                hint={t.noItemsHint}
              />
            )}
          </div>
        )}

        <div className="my-6 border-t border-(--menu-border)" />

        <div className="mt-4">
          <SocialLinksBar
            restaurant={menu.restaurant}
            hideFloating={selectedDish !== null}
          />
        </div>

        <Footer restaurant={menu.restaurant} language={language} />
      </div>

      <ReviewFab restaurant={menu.restaurant} language={language} />
    </div>
  );
}

function FullScreenDish({
  dish,
  devise,
  language,
  liked,
  onLike,
  onClose,
  t,
}: {
  dish: DishResponse;
  devise: FullMenuResponse["devise"];
  language: Language;
  liked: boolean;
  onLike: () => void;
  onClose: () => void;
  t: MenuStrings;
}) {
  const { name, description } = getDishText(dish, language);
  const available = isDishAvailable(dish);

  const fallbackLang = !dish.translations[language]
    ? ((Object.keys(dish.translations)[0] as Language | undefined) ?? null)
    : null;

  const sizes = dish.sizes ?? [];
  const hasMultipleSizes = sizes.length > 1;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedSize = sizes[selectedIndex] ?? sizes[0];

  const supplements = (dish.supplements ?? []).filter(
    (s) => (s.isAvailable ?? s.available) && (s.isVisible ?? s.visible),
  );

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm hidden sm:block" />

      <div
        className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-107.5 sm:rounded-3xl overflow-hidden z-10 flex flex-col bg-(--menu-card)"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image - same fixed height as DishModal */}
        <div className="relative shrink-0" style={{ height: 240 }}>
          {dish.imageUrl ? (
            <img
               src={dish.imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-(--menu-secondary) text-5xl">
              🍽️
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-b from-black/25 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 inset-e-4 w-9 h-9 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center text-white"
            aria-label={t.close}
          >
            <X className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onLike}
            className="absolute top-4 inset-s-4 w-9 h-9 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center"
            aria-label={t.like}
          >
            <Heart
              className="w-4 h-4"
              fill={liked ? "var(--menu-danger)" : "none"}
              stroke={liked ? "var(--menu-danger)" : "white"}
              strokeWidth={2}
            />
          </button>

          {!available && (
            <div className="absolute bottom-3 inset-s-4 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-500 text-white">
              {t.unavailable}
            </div>
          )}

          {fallbackLang && (
            <div
              className="absolute bottom-3 inset-e-4 px-2 py-1 rounded text-[10px] font-bold uppercase"
              style={{
                background: "var(--menu-accent)",
                color: "#fff",
                letterSpacing: "0.04em",
              }}
            >
              {t.shownIn}: {fallbackLang}
            </div>
          )}
        </div>

        {/* Body */}
        <div
          className="overflow-y-auto flex-1 px-5 pt-4 pb-4"
          style={{ scrollbarWidth: "none", overscrollBehavior: "contain" }}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-xl font-semibold text-(--menu-primary) flex-1 leading-tight menu-font-display">
              {name}
            </h2>
            <p className="text-xl font-bold text-(--menu-accent) shrink-0">
              {formatPrice(selectedSize?.price ?? 0, devise)}
            </p>
          </div>

          {hasMultipleSizes && (
            <div className="mb-5">
              <h3 className="text-sm font-bold text-(--menu-primary) mb-2">
                {SIZES_LABEL[language]}
              </h3>

              <div className="flex flex-wrap gap-2">
                {sizes.map((size, index) => {
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={`${size.name}-${index}`}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={`px-3 py-2 rounded-full text-xs font-semibold border transition-colors ${
                        isSelected
                          ? "bg-(--menu-accent) border-(--menu-accent) text-white"
                          : "bg-transparent border-(--menu-border) text-(--menu-primary)"
                      }`}
                    >
                      {size.name} · {formatPrice(size.price, devise)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {description && (
            <p className="text-sm text-(--menu-muted) leading-relaxed mb-5">
              {description}
            </p>
          )}

          {dish.likesCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-(--menu-muted) mb-4">
              <Heart
                className="w-4 h-4"
                fill="var(--menu-danger)"
                stroke="var(--menu-danger)"
              />
              {dish.likesCount} {t.likes}
            </div>
          )}

          {supplements.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-bold text-(--menu-primary) mb-2">
                {SUPPLEMENTS_LABEL[language]}
              </h3>

              <div className="flex flex-col rounded-xl border border-(--menu-border) overflow-hidden">
                {supplements.map((supplement, index) => {
                  const supplementName = getSupplementName(
                    supplement,
                    language,
                  );

                  return (
                    <div
                      key={supplement.id}
                      className={`flex items-center justify-between px-4 py-2.5 ${
                        index !== supplements.length - 1
                          ? "border-b border-(--menu-border)"
                          : ""
                      }`}
                    >
                      <span className="text-sm text-(--menu-primary)">
                        {supplementName}
                      </span>
                      <span className="text-sm font-semibold text-(--menu-accent)">
                        {formatPrice(supplement.price, devise)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer - same Button component as DishModal */}
        <div className="px-5 py-4 border-t border-(--menu-border) bg-(--menu-card) shrink-0">
          <Button
            label={t.close}
            onClick={onClose}
            variant="secondary"
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}
