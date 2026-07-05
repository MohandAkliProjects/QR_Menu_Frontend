import { useState } from "react";
import { Heart, X } from "lucide-react";

import type {
  CategoryWithDishesResponse,
  DishResponse,
  FullMenuResponse,
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
import RestaurantInfoCard from "./RestaurantInfoCard";
import SocialFab from "./SocialFab";
import ReviewFab from "./Reviewfab";
import Footer from "./Footer";
import DishCard from "./DishCard";
import EmptyCategory from "./EmptyCategory";

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "EN",
  fr: "FR",
  ar: "AR",
};

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
    useState<CategoryWithDishesResponse | null>(null);
  const [selectedDish, setSelectedDish] = useState<DishResponse | null>(null);

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
      {/* FULL SCREEN DISH VIEW */}
      {selectedDish && (
        <FullScreenDish
          dish={selectedDish}
          devise={menu.devise}
          language={language}
          liked={liked.has(selectedDish.id)}
          onLike={() => onLike(selectedDish.id)}
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

        {/* Big centered restaurant identity */}
        <div className="pt-6 pb-4 flex flex-col items-center text-center">
          {menu.restaurant.logoUrl ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-[var(--menu-border)] shadow-sm bg-[var(--menu-card)] mb-3">
              <img
                src={menu.restaurant.logoUrl}
                alt={menu.restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-[var(--menu-border)] shadow-sm bg-[var(--menu-secondary)] flex items-center justify-center mb-3">
              <span className="text-2xl sm:text-3xl font-bold text-[var(--menu-primary)] menu-font-display">
                {menu.restaurant.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {menuTitle && (
            <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--menu-accent)] uppercase mb-1">
              {menuTitle}
            </p>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--menu-primary)] menu-font-display leading-tight">
            {menu.restaurant.name}
          </h1>

          {(menu.restaurant.address || menu.restaurant.ville) && (
            <p className="text-sm text-[var(--menu-muted)] mt-1">
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
                      ? "bg-[var(--menu-primary)] text-white"
                      : "bg-[var(--menu-secondary)] text-[var(--menu-primary)]"
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
                onClick={() => setActiveCategory(category)}
              />
            ))}
          </div>
        ) : (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveCategory(null)}
                className="text-xl leading-none px-1"
                style={{ color: "var(--menu-primary)" }}
                aria-label="Back"
              >
                {isRTL(language) ? "→" : "←"}
              </button>
              <h2 className="text-lg font-bold text-[var(--menu-primary)] menu-font-display">
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
                    onClick={() => setSelectedDish(dish)}
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

        <div className="my-6 border-t border-[var(--menu-border)]" />

        <RestaurantInfoCard restaurant={menu.restaurant} />

        <Footer restaurant={menu.restaurant} language={language} />
      </div>

      <SocialFab restaurant={menu.restaurant} />
      <ReviewFab restaurant={menu.restaurant} language={language} />
    </div>
  );
}

// Full-screen dish view - same like/close behavior as DishModal, just full page instead of a bottom sheet
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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      style={{ background: "var(--menu-bg)" }}
    >
      <div className="relative flex-shrink-0" style={{ height: "45vh" }}>
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--menu-secondary)] text-6xl">
            🍽️
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-transparent" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 start-4 w-9 h-9 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center text-white"
          aria-label={t.close}
        >
          <X className="w-4 h-4" />
        </button>

        {!available && (
          <div className="absolute bottom-3 start-4 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-500 text-white">
            {t.unavailable}
          </div>
        )}
      </div>

      <div className="flex-1 px-5 pt-5 pb-8 max-w-2xl mx-auto w-full">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-2xl font-bold text-[var(--menu-primary)] menu-font-display leading-tight">
            {name}
          </h1>
          <button
            type="button"
            onClick={onLike}
            className="flex-shrink-0"
            aria-label={t.like}
          >
            <Heart
              className="w-6 h-6"
              fill={liked ? "var(--menu-danger)" : "none"}
              stroke={liked ? "var(--menu-danger)" : "var(--menu-muted)"}
              strokeWidth={2}
            />
          </button>
        </div>

        <p className="text-xl font-bold text-[var(--menu-accent)] mb-4">
          {formatPrice(dish.price, devise)}
        </p>

        {description && (
          <p className="text-sm text-[var(--menu-muted)] leading-relaxed mb-4">
            {description}
          </p>
        )}

        {dish.likesCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-[var(--menu-muted)]">
            <Heart
              className="w-4 h-4"
              fill="var(--menu-danger)"
              stroke="var(--menu-danger)"
            />
            {dish.likesCount} {t.likes}
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-[var(--menu-border)] bg-[var(--menu-bg)] flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-sm"
          style={{
            background: "var(--menu-secondary)",
            color: "var(--menu-primary)",
          }}
        >
          {t.close}
        </button>
      </div>
    </div>
  );
}