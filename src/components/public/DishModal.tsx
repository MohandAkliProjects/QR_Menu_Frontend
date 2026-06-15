import { useEffect } from "react";
import { Heart, X } from "lucide-react";

import type { DishResponse } from "../../types/api";
import type { Devise, Language } from "../../types/enums";
import { formatPrice, getDishText, isDishAvailable } from "../../utils/menu-display";

interface DishModalProps {
  dish: DishResponse;
  devise: Devise;
  language: Language;
  liked: boolean;
  onLike: () => void;
  onClose: () => void;
}

function getActiveLang(
  translations: Partial<Record<Language, unknown>>,
  language: Language
): Language | null {
  if (translations[language]) return null;
  const fallback = Object.keys(translations)[0] as Language | undefined;
  return fallback ?? null;
}

function DishModal({ dish, devise, language, liked, onLike, onClose }: DishModalProps) {
  const { name, description } = getDishText(dish, language);
  const available = isDishAvailable(dish);
  const fallbackLang = getActiveLang(dish.translations, language);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[430px] bg-[var(--menu-card)] rounded-t-3xl overflow-hidden z-10 flex flex-col"
        style={{ maxHeight: "92vh", animation: "menu-slide-up 0.28s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative flex-shrink-0" style={{ height: 240 }}>
          {dish.imageUrl ? (
            <img src={dish.imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--menu-secondary)] text-5xl">
              🍽️
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-transparent" />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 end-4 w-9 h-9 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center text-white"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Like */}
          <button
            type="button"
            onClick={onLike}
            className="absolute top-4 start-4 w-9 h-9 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center"
            aria-label="Like"
          >
            <Heart
              className="w-4 h-4"
              fill={liked ? "var(--menu-danger)" : "none"}
              stroke={liked ? "var(--menu-danger)" : "white"}
              strokeWidth={2}
            />
          </button>

          {/* Unavailable badge */}
          {!available && (
            <div className="absolute bottom-3 start-4 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-500 text-white">
              Unavailable
            </div>
          )}

          {/* Language fallback badge */}
          {fallbackLang && (
            <div
              className="absolute bottom-3 end-4 px-2 py-1 rounded text-[10px] font-bold uppercase"
              style={{ background: "var(--menu-accent)", color: "#fff", letterSpacing: "0.04em" }}
            >
              Shown in: {fallbackLang}
            </div>
          )}
        </div>

        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--menu-border)]" />
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 pt-3 pb-4" style={{ scrollbarWidth: "none" }}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-xl font-semibold text-[var(--menu-primary)] flex-1 leading-tight menu-font-display">
              {name}
            </h2>
            <p className="text-xl font-bold text-[var(--menu-accent)] flex-shrink-0">
              {formatPrice(dish.price, devise)}
            </p>
          </div>

          {description && (
            <p className="text-sm text-[var(--menu-muted)] leading-relaxed mb-4">{description}</p>
          )}

          {dish.likesCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-[var(--menu-muted)] mb-4">
              <Heart className="w-4 h-4" fill="var(--menu-danger)" stroke="var(--menu-danger)" />
              {dish.likesCount} {dish.likesCount === 1 ? "like" : "likes"}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--menu-border)] bg-[var(--menu-card)] flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98] bg-[var(--menu-primary)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DishModal;