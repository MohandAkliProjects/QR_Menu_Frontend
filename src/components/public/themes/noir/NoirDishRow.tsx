import { Heart } from "lucide-react";

import type { DishResponse } from "../../../../types/api";
import type { Devise, Language } from "../../../../types/enums";
import { formatPrice, getDishText, isDishAvailable } from "../../../../utils/menu-display";
import type { MenuStrings } from "../../../../lib/constants/menu-strings";

interface NoirDishRowProps {
  dish: DishResponse;
  devise: Devise;
  language: Language;
  liked: boolean;
  onLike: () => void;
  onClick: () => void;
  t: MenuStrings;
}

function cutCorner(px: number) {
  return `polygon(0 0, calc(100% - ${px}px) 0, 100% ${px}px, 100% 100%, 0 100%)`;
}

function getRowPriceDisplay(dish: DishResponse, devise: Devise): string {
  const sizes = dish.sizes ?? [];
  if (sizes.length === 0) return "";
  const min = Math.min(...sizes.map((s) => s.price));
  return formatPrice(min, devise);
}

export default function NoirDishRow({
  dish,
  devise,
  language,
  liked,
  onLike,
  onClick,
  t,
}: NoirDishRowProps) {
  const { name, description } = getDishText(dish, language);
  const available = isDishAvailable(dish);
  const priceDisplay = getRowPriceDisplay(dish, devise);
  const hasMultipleSizes = (dish.sizes?.length ?? 0) > 1;

  return (
    <div
      className={`flex items-center gap-3 py-3 cursor-pointer ${available ? "" : "opacity-50"}`}
      style={{ borderTop: "1px dashed var(--menu-border)" }}
      onClick={onClick}
    >
      <div
        className="w-14 h-14 shrink-0 overflow-hidden"
        style={{ clipPath: cutCorner(8), background: "var(--menu-secondary)" }}
      >
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={name}
            className={`w-full h-full object-cover ${available ? "" : "grayscale"}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-(--menu-primary) line-clamp-1">
          {name}
          {!available && (
            <span className="ms-2 text-xs font-normal italic text-(--menu-muted)">
              ({t.unavailable})
            </span>
          )}
        </h3>
        {description && (
          <p className="text-[11px] text-(--menu-muted) mt-0.5 line-clamp-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-bold text-(--menu-accent) text-end">
          {priceDisplay}
          {hasMultipleSizes && <span className="text-[10px] text-(--menu-muted)"> +</span>}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="w-6 h-6 flex items-center justify-center"
          aria-label={t.like}
        >
          <Heart
            className="w-3.5 h-3.5"
            fill={liked ? "var(--menu-danger)" : "none"}
            stroke={liked ? "var(--menu-danger)" : "var(--menu-muted)"}
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}