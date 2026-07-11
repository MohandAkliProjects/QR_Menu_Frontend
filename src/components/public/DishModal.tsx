import { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";

import type { DishResponse } from "../../types/api";
import type { Devise, Language } from "../../types/enums";
import { formatPrice, getDishText, isDishAvailable } from "../../utils/menu-display";
import type { MenuStrings } from "../../lib/constants/menu-strings";
import Button from "../ui/Button";

interface DishModalProps {
  dish: DishResponse;
  devise: Devise;
  language: Language;
  liked: boolean;
  onLike: () => void;
  onClose: () => void;
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

function DishModal({ dish, devise, language, liked, onLike, onClose, t }: DishModalProps) {
  const { name, description } = getDishText(dish, language);
  const available = isDishAvailable(dish);
  const fallbackLang = getActiveLang(dish.translations, language);

  const sizes = dish.sizes ?? [];
  const hasMultipleSizes = sizes.length > 1;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedSize = sizes[selectedIndex] ?? sizes[0];

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
        className="relative w-full max-w-107.5 bg-(--menu-card) rounded-t-3xl overflow-hidden z-10 flex flex-col"
        style={{ maxHeight: "92vh", animation: "menu-slide-up 0.28s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative shrink-0" style={{ height: 240 }}>
          {dish.imageUrl ? (
            <img src={dish.imageUrl} alt={name} className="w-full h-full object-cover" />
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
              style={{ background: "var(--menu-accent)", color: "#fff", letterSpacing: "0.04em" }}
            >
              {t.shownIn}: {fallbackLang}
            </div>
          )}
        </div>

        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 shrink-0">
          <div className="w-10 h-1 rounded-full bg-(--menu-border)" />
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 pt-3 pb-4" style={{ scrollbarWidth: "none" }}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-xl font-semibold text-(--menu-primary) flex-1 leading-tight menu-font-display">
              {name}
            </h2>
            <p className="text-xl font-bold text-(--menu-accent) shrink-0">
              {formatPrice(selectedSize?.price ?? 0, devise)}
            </p>
          </div>

          {description && (
            <p className="text-sm text-(--menu-muted) leading-relaxed mb-4">{description}</p>
          )}

          {hasMultipleSizes && (
            <div className="flex flex-wrap gap-2 mb-4">
              {sizes.map((size, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={`${size.name}-${index}`}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
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
          )}

          {dish.likesCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-(--menu-muted) mb-4">
              <Heart className="w-4 h-4" fill="var(--menu-danger)" stroke="var(--menu-danger)" />
              {dish.likesCount} {t.likes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-(--menu-border) bg-(--menu-card) shrink-0">
          <Button label={t.close} onClick={onClose} variant="secondary" fullWidth />
        </div>
      </div>
    </div>
  );
}

export default DishModal;