import { Heart } from "lucide-react";

import type { DishResponse } from "../../../../types/api";
import type { Devise, Language } from "../../../../types/enums";
import {
  formatPrice,
  getDishText,
  isDishAvailable,
} from "../../../../utils/menu-display";
import type { MenuStrings } from "../../../../lib/constants/menu-strings";

interface EmberDishCardProps {
  dish: DishResponse;
  devise: Devise;
  language: Language;
  liked: boolean;
  onLike: () => void;
  onClick: () => void;
  t: MenuStrings;
}

const SIZES_COUNT_LABEL: Record<Language, string> = {
  en: "sizes",
  fr: "tailles",
  ar: "أحجام",
};

// Jagged "torn paper" bottom edge for the photo — 7 teeth.
const TORN_EDGE_CLIP_PATH =
  "polygon(0% 0%, 100% 0%, 100% 90%, 91.7% 100%, 83.3% 90%, 75% 100%, 66.7% 90%, 58.3% 100%, 50% 90%, 41.7% 100%, 33.3% 90%, 25% 100%, 16.7% 90%, 8.3% 100%, 0% 90%)";

function getActiveLang(
  translations: Partial<Record<Language, unknown>>,
  language: Language,
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
  return formatPrice(min, devise);
}

export default function EmberDishCard({
  dish,
  devise,
  language,
  liked,
  onLike,
  onClick,
  t,
}: EmberDishCardProps) {
  const { name, description } = getDishText(dish, language);
  const available = isDishAvailable(dish);
  const fallbackLang = getActiveLang(dish.translations, language);
  const priceDisplay = getCardPriceDisplay(dish, devise);
  const hasMultipleSizes = (dish.sizes?.length ?? 0) > 1;

  return (
    <div
      className={`cursor-pointer transition-transform active:scale-[0.97] ${
        available ? "" : "grayscale opacity-70"
      }`}
      onClick={onClick}
    >
      {/* Photo — torn/perforated bottom edge */}
      <div
        className="relative"
        style={{ paddingTop: "78%", clipPath: TORN_EDGE_CLIP_PATH }}
      >
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-3xl"
            style={{ background: "var(--menu-secondary)" }}
          >
            🍽️
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/35 to-transparent" />

        {!available && (
          <div
            className="absolute top-[38%] left-[-10%] w-[130%] py-1 text-center text-[10px] font-bold uppercase tracking-[0.15em] -rotate-6"
            style={{
              background: "rgba(20,17,15,0.85)",
              color: "var(--menu-accent)",
              border: "1px solid var(--menu-accent)",
            }}
          >
            {t.unavailable}
          </div>
        )}

        {fallbackLang && (
          <div
            className="absolute bottom-3 inset-s-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
            style={{
              background: "var(--menu-accent)",
              color: "#fff",
              letterSpacing: "0.04em",
            }}
          >
            {fallbackLang}
          </div>
        )}

        <button
          type="button"
          className="absolute top-2 inset-e-2 w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{
            background: "var(--menu-secondary)",
            boxShadow:
              "0 0 0 2px var(--menu-accent), 0 0 0 4px var(--menu-bg)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          aria-label={t.like}
        >
          <Heart
            className="w-3.5 h-3.5 transition-colors"
            fill={liked ? "var(--menu-danger)" : "none"}
            stroke={liked ? "var(--menu-danger)" : "var(--menu-muted)"}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Ticket stub */}
      <div
        className="-mt-[2px] rounded-b-lg px-3 pt-3 pb-2.5"
        style={{
          background: "var(--menu-card)",
          border: "1px solid var(--menu-border)",
          borderTop: "none",
        }}
      >
        <h3 className="menu-font-display text-sm font-semibold text-(--menu-primary) line-clamp-1">
          {name}
        </h3>
        {description && (
          <p className="text-[11px] text-(--menu-muted) mt-0.5 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        <div
          className="mt-2 pt-2 flex items-center justify-between"
          style={{ borderTop: "1px dashed var(--menu-border)" }}
        >
          <span className="text-sm font-bold text-(--menu-accent)">
            {priceDisplay}
            {hasMultipleSizes && (
              <span className="text-[10px] font-medium text-(--menu-muted) ms-1">
                +{dish.sizes.length} {SIZES_COUNT_LABEL[language]}
              </span>
            )}
          </span>
          {dish.likesCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-(--menu-muted)">
              <Heart
                className="w-3 h-3"
                fill="var(--menu-danger)"
                stroke="var(--menu-danger)"
              />
              {dish.likesCount} {t.likes}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}