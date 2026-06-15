import { Heart } from "lucide-react";

import type { DishResponse } from "../types/api";
import type { Devise, Language } from "../types/enums";
import { formatPrice, getDishText, isDishAvailable } from "../utils/menu-display";

interface DishCardProps {
  dish: DishResponse;
  devise: Devise;
  language: Language;
  liked: boolean;
  onLike: () => void;
  onClick: () => void;
}

/**
 * Replaces the old `DishCard`. Dropped vs. the Figma `MenuCard`:
 * - "New" / "Popular" badges and tags (Vegan, Halal, ...) - no such
 *   fields on `DishResponse` yet
 * - star rating
 *
 * Kept/adapted:
 * - "Unavailable" badge derived from `isAvailable`
 * - like button (visual toggle only - actual like submission is
 *   handled by the page via the existing "coming soon" toast)
 * - likes count, shown only when > 0
 */
function DishCard({ dish, devise, language, liked, onLike, onClick }: DishCardProps) {
  const { name, description } = getDishText(dish, language);
  const available = isDishAvailable(dish);

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
            Unavailable
          </div>
        )}

        <button
          type="button"
          className="absolute top-2 end-2 w-7 h-7 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-sm transition-transform active:scale-90"
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          aria-label="Like"
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
            {formatPrice(dish.price, devise)}
          </span>
          {dish.likesCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-[var(--menu-muted)]">
              <Heart className="w-3 h-3" fill="var(--menu-danger)" stroke="var(--menu-danger)" />
              {dish.likesCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default DishCard;