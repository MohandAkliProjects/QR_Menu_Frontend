import { useEffect } from "react";
import { X, Heart } from "lucide-react";
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
  onClose: () => void;
  onLike: () => void;
}

export default function DishModal({ dish, devise, language, onClose, onLike }: Props) {
  const translation = dish.translations[language] ?? Object.values(dish.translations)[0];
  const symbol = DEVISE_SYMBOLS[devise] ?? devise;
  const likeCount = Array.isArray(dish.likes) ? dish.likes.length : (dish.likes ?? 0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full sm:max-w-md bg-background-primary rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {dish.imageUrl ? (
          <div className="relative w-full aspect-square sm:aspect-[4/3]">
            <img
              src={dish.imageUrl}
              alt={translation?.name ?? ""}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-beige-100 flex items-center justify-center">
            <span className="text-5xl opacity-40">🍽️</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-dark-800 leading-tight">
              {translation?.name ?? "—"}
            </h2>
            <span className="text-lg font-bold text-primary-700 shrink-0">
              {dish.price.toLocaleString()} {symbol}
            </span>
          </div>

          {translation?.description && (
            <p className="text-sm text-text-400 leading-relaxed">
              {translation.description}
            </p>
          )}

          <button
            onClick={onLike}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-beige-100 hover:bg-primary-100 text-text-400 hover:text-primary-700 transition-all duration-200 text-sm font-medium"
          >
            <Heart className="w-4 h-4" />
            <span>Like this dish · {likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}