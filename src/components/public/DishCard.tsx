import { Heart } from "lucide-react";
import type { DishResponse } from "../../types";
import type { Devise, Language } from "../../types/enums";

const DEVISE_SYMBOLS: Record<Devise, string> = {
  dzd: "DA", eur: "€", usd: "$", gbp: "£",
  sar: "﷼", aed: "AED", try: "₺", cad: "CA$", chf: "CHF", cny: "¥",
};

interface Props {
  dish: DishResponse;
  devise: Devise;
  language: Language;
  onLike: () => void;
  onClick: () => void;
}

export default function DishCard({ dish, devise, language, onLike, onClick }: Props) {
  const translation = dish.translations[language] ?? Object.values(dish.translations)[0];
  const symbol = DEVISE_SYMBOLS[devise] ?? devise;
  const likeCount = Array.isArray(dish.likes) ? dish.likes.length : (dish.likes ?? 0);

  return (
    <div
      onClick={onClick}
      className="
        flex flex-col rounded-2xl overflow-hidden cursor-pointer
        bg-background-primary border border-border-tertiary
        hover:shadow-lg active:scale-[0.98]
        transition-all duration-200
      "
    >
      <div className="relative w-full aspect-square bg-beige-100">
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={translation?.name ?? ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-40">🍽️</span>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onLike(); }}
          className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs"
          aria-label="Like dish"
        >
          <Heart className="w-3.5 h-3.5" />
          <span>{likeCount}</span>
        </button>
      </div>

      <div className="flex flex-col gap-1 p-3">
        <span className="text-sm font-semibold text-dark-800 leading-snug line-clamp-1">
          {translation?.name ?? "—"}
        </span>
        {translation?.description && (
          <p className="text-xs text-text-400 leading-relaxed line-clamp-2">
            {translation.description}
          </p>
        )}
        <span className="text-sm font-bold text-primary-700 mt-1">
          {dish.price.toLocaleString()} {symbol}
        </span>
      </div>
    </div>
  );
}