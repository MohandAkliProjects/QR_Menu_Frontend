import { useEffect, useState } from "react";
import { Heart, X, ChevronDown } from "lucide-react";

import type {
  CategoryWithDishesResponse,
  DishResponse,
  FullMenuResponse,
} from "../../../../types/api";
import type { Language } from "../../../../types/enums";
import {
  formatPrice,
  getCategoryName,
  getDishText,
  isDishAvailable,
  isRTL,
} from "../../../../utils/menu-display";
import type { MenuStrings } from "../../../../lib/constants/menu-strings";

import HeroCarousel from "../../HeroCarousel";
import SocialLinksBar from "../../SocialLinksBar";
import ReviewFab from "../../Reviewfab";
import Footer from "../../Footer";
import EmptyCategory from "../../EmptyCategory";
import Button from "../../../ui/Button";
import NoirDishRow from "./NoirDishRow";
import type { MenuThemeProps } from "../types";
import "../../../../styles/themes/noir.css";

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "EN",
  fr: "FR",
  ar: "AR",
};

function CornerBracket({
  position,
}: {
  position: "top-start" | "bottom-end";
}) {
  const isTop = position === "top-start";
  return (
    <span
      aria-hidden
      className="absolute w-4 h-4 pointer-events-none"
      style={{
        ...(isTop
          ? { top: 0, insetInlineStart: 0, borderBlockStart: "1px solid var(--menu-accent)", borderInlineStart: "1px solid var(--menu-accent)" }
          : { bottom: 0, insetInlineEnd: 0, borderBlockEnd: "1px solid var(--menu-accent)", borderInlineEnd: "1px solid var(--menu-accent)" }),
      }}
    />
  );
}


function cutCorner(px: number) {
  return `polygon(0 0, calc(100% - ${px}px) 0, 100% ${px}px, 100% 100%, 0 100%)`;
}

type NoirMenuLayoutProps = MenuThemeProps;

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

export default function NoirMenuLayout({
  menu,
  language,
  availableLanguages,
  onLanguageChange,
  liked,
  onLike,
  t,
}: NoirMenuLayoutProps) {
  const [expandedCategory, setExpandedCategory] =
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
      setExpandedCategory(category);
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

  function toggleCategory(category: CategoryWithDishesResponse) {
    if (expandedCategory?.id === category.id) {
      closeCategory();
      return;
    }
    window.history.pushState(
      { menuView: "category" },
      "",
      buildUrl(category.id, null),
    );
    setExpandedCategory(category);
    setSelectedDish(null);
  }

  function closeCategory() {
    if (window.history.state?.menuView === "category") {
      window.history.back();
    } else {
      window.history.replaceState({}, "", buildUrl(null, null));
      setExpandedCategory(null);
    }
  }

  function openDish(dish: DishResponse) {
    if (!expandedCategory) return;
    window.history.pushState(
      { menuView: "dish" },
      "",
      buildUrl(expandedCategory.id, dish.id),
    );
    setSelectedDish(dish);
  }

  function closeDish() {
    if (window.history.state?.menuView === "dish") {
      window.history.back();
    } else if (expandedCategory) {
      window.history.replaceState({}, "", buildUrl(expandedCategory.id, null));
      setSelectedDish(null);
    }
  }

  return (
    <div
      data-theme="noir"
      dir={isRTL(language) ? "rtl" : "ltr"}
      className="min-h-screen"
      style={{
        background: "var(--menu-bg)",
        fontFamily: 'var(--menu-font-body, "Inter", system-ui, sans-serif)',
      }}
    >
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

      
        <div
          className="relative mt-6 py-6 text-center"
          style={{
            borderTop: "1px solid var(--menu-border)",
            borderBottom: "1px solid var(--menu-border)",
          }}
        >
          <CornerBracket position="top-start" />
          <CornerBracket position="bottom-end" />

          {menuTitle && (
            <p className="text-[10px] font-semibold tracking-[0.3em] text-(--menu-accent) uppercase mb-2">
              {menuTitle}
            </p>
          )}

          <div className="flex items-center justify-center gap-2.5">
            {menu.restaurant.logoUrl && (
              <img
                src={menu.restaurant.logoUrl}
                alt={menu.restaurant.name}
                className="w-7 h-7 rounded-full object-cover"
                style={{ border: "1px solid var(--menu-accent)" }}
              />
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-(--menu-primary) menu-font-display leading-tight">
              {menu.restaurant.name}
            </h1>
          </div>

          {(menu.restaurant.address || menu.restaurant.ville) && (
            <p className="text-sm text-(--menu-muted) mt-2">
              {menu.restaurant.address || menu.restaurant.ville}
            </p>
          )}

          {availableLanguages.length > 1 && (
            <div className="flex gap-1.5 mt-4 justify-center">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onLanguageChange(lang)}
                  className="px-2.5 py-1 text-[11px] font-bold transition-colors"
                  style={{
                    border: "1px solid var(--menu-accent)",
                    background:
                      lang === language ? "var(--menu-accent)" : "transparent",
                    color: lang === language ? "#0b0b0d" : "var(--menu-primary)",
                  }}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LEDGER — accordion index of categories */}
        <div className="mt-6">
          {menu.categories.map((category) => {
            const isOpen = expandedCategory?.id === category.id;
            const label = getCategoryName(category, language);

            return (
              <div key={category.id} style={{ borderBottom: "1px solid var(--menu-border)" }}>
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between py-4 text-start"
                >
                  <span className="text-sm font-semibold tracking-[0.12em] uppercase text-(--menu-primary) menu-font-display">
                    {label}
                  </span>
                  <span className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-(--menu-muted)">
                      {category.dishes.length}
                    </span>
                    <ChevronDown
                      className="w-4 h-4 transition-transform duration-300"
                      style={{
                        color: "var(--menu-accent)",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </span>
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    {category.dishes.length > 0 ? (
                      <div className="flex flex-col pb-4">
                        {category.dishes.map((dish) => (
                          <NoirDishRow
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
                      <div className="pb-4">
                        <EmptyCategory
                          title={t.noItemsTitle}
                          message={t.noDishes}
                          hint={t.noItemsHint}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
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
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm hidden sm:block" />

      <div
        className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-107.5 overflow-hidden z-10 flex flex-col"
        style={{ background: "var(--menu-card)", border: "1px solid var(--menu-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative shrink-0"
          style={{ height: 240, clipPath: cutCorner(28) }}
        >
          {dish.imageUrl ? (
            <img src={dish.imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: "var(--menu-secondary)" }}>
              🍽️
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-b from-black/40 to-transparent" />
          <CornerBracket position="top-start" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 inset-e-4 w-8 h-8 flex items-center justify-center text-white"
            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid var(--menu-accent)" }}
            aria-label={t.close}
          >
            <X className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onLike}
            className="absolute top-4 inset-s-4 w-8 h-8 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid var(--menu-accent)" }}
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
            <div
              className="absolute bottom-3 inset-s-4 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
              style={{ background: "rgba(0,0,0,0.6)", color: "var(--menu-muted)", border: "1px solid var(--menu-border)" }}
            >
              {t.unavailable}
            </div>
          )}

          {fallbackLang && (
            <div
              className="absolute bottom-3 inset-e-4 px-2 py-1 text-[10px] font-bold uppercase"
              style={{ background: "var(--menu-accent)", color: "#0b0b0d", letterSpacing: "0.04em" }}
            >
              {t.shownIn}: {fallbackLang}
            </div>
          )}
        </div>

        <div className="overflow-y-auto flex-1 px-5 pt-4 pb-4" style={{ scrollbarWidth: "none", overscrollBehavior: "contain" }}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-xl font-semibold text-(--menu-primary) flex-1 leading-tight menu-font-display">
              {name}
            </h2>
            <p className="text-xl font-bold text-(--menu-accent) shrink-0">
              {formatPrice(selectedSize?.price ?? 0, devise)}
            </p>
          </div>

          {hasMultipleSizes && (
            <div className="mb-5 flex flex-wrap gap-2">
              {sizes.map((size, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={`${size.name}-${index}`}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className="px-3 py-2 text-xs font-semibold transition-colors"
                    style={{
                      border: "1px solid var(--menu-accent)",
                      background: isSelected ? "var(--menu-accent)" : "transparent",
                      color: isSelected ? "#0b0b0d" : "var(--menu-primary)",
                    }}
                  >
                    {size.name} · {formatPrice(size.price, devise)}
                  </button>
                );
              })}
            </div>
          )}

          {description && (
            <p className="text-sm text-(--menu-muted) leading-relaxed mb-5">
              {description}
            </p>
          )}

          {dish.likesCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-(--menu-muted) mb-4">
              <Heart className="w-4 h-4" fill="var(--menu-danger)" stroke="var(--menu-danger)" />
              {dish.likesCount} {t.likes}
            </div>
          )}
        </div>

        <div className="px-5 py-4 shrink-0" style={{ borderTop: "1px solid var(--menu-border)" }}>
          <Button label={t.close} onClick={onClose} variant="secondary" fullWidth />
        </div>
      </div>
    </div>
  );
}