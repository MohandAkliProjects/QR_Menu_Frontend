import { Heart } from "lucide-react";

import type { DishResponse } from "../../types/api";
import type { Devise, Language } from "../../types/enums";
import { formatPrice, getDishText, isDishAvailable } from "../../utils/menu-display";
import type { MenuStrings } from "../../lib/constants/menu-strings";

interface DishCardProps {
  dish: DishResponse;
  devise: Devise;
  language: Language;
  liked: boolean;
  onLike: () => void;
  onClick: () => void;
  t: MenuStrings;
}

function getActiveLang(
  translations: Partial<Record<Language, unknown>>,
  language: Language
): Language | null {
  if (translations[language]) return null;
  const fallback = Object.keys(translations)[0] as Language | undefined;
  return fallback ?? null;
}

function getCardPriceDisplay(dish: DishResponse, devise: Devise): string {
  const sizes = dish.sizes ?? [];
  if (sizes.length === 0) return "";
  if (sizes.length === 1) return formatPrice(sizes[0].price, devise);

  const min = Math.min(...sizes.map((s) => s.price));
  return `${formatPrice(min, devise)}+`;
}

function DishCard({ dish, devise, language, liked, onLike, onClick, t }: DishCardProps) {
  const { name, description } = getDishText(dish, language);
  const available = isDishAvailable(dish);
  const fallbackLang = getActiveLang(dish.translations, language);
  const priceDisplay = getCardPriceDisplay(dish, devise);
  const hasMultipleSizes = (dish.sizes?.length ?? 0) > 1;

  return (
    <div
      className={`bg-[var(--menu-card)] rounded-2xl overflow-hidden shadow-sm border border-[var(--menu-border)] cursor-pointer transition-all duration-200 active:scale-[0.97] hover:shadow-md ${
        available ? "" : "opacity-60"
      }`}
      onClick={onClick}
    >
      <div className="relative" style={{ paddingTop: "72%" }}>
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--menu-secondary)] text-3xl">
            🍽️
          </div>
        )}

        {!available && (
          <div className="absolute top-2 start-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-500 text-white">
            {t.unavailable}
          </div>
        )}

        {fallbackLang && (
          <div
            className="absolute bottom-2 start-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
            style={{ background: "var(--menu-accent)", color: "#fff", letterSpacing: "0.04em" }}
          >
            {fallbackLang}
          </div>
        )}

        <button
          type="button"
          className="absolute top-2 end-2 w-7 h-7 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-sm transition-transform active:scale-90"
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          aria-label={t.like}
        >
          <Heart
            className="w-3.5 h-3.5 transition-colors"
            fill={liked ? "var(--menu-danger)" : "none"}
            stroke={liked ? "var(--menu-danger)" : "#6B5D56"}
            strokeWidth={2}
          />
        </button>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-bold text-[var(--menu-primary)] line-clamp-1">{name}</h3>
        {description && (
          <p className="text-[11px] text-[var(--menu-muted)] mt-0.5 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-[var(--menu-accent)]">
            {priceDisplay}
            {hasMultipleSizes && (
              <span className="text-[10px] font-medium text-[var(--menu-muted)] ms-1">
                / {dish.sizes.length} tailles
              </span>
            )}
          </span>
          {dish.likesCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-[var(--menu-muted)]">
              <Heart className="w-3 h-3" fill="var(--menu-danger)" stroke="var(--menu-danger)" />
              {dish.likesCount} {t.likes}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default DishCard;