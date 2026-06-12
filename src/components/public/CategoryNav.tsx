import { useEffect, useRef } from "react";
import type { CategoryWithDishesResponse } from "../../types";
import type { Language } from "../../types/enums";

interface Props {
  categories: CategoryWithDishesResponse[];
  activeCategoryId: string;
  language: Language;
  onSelect: (id: string) => void;
  allId: string;
}

export default function CategoryNav({
  categories = [],
  activeCategoryId,
  language,
  onSelect,
  allId,
}: Props) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeCategoryId]);

  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
      {/* All */}
      <button
        ref={activeCategoryId === allId ? activeRef : null}
        onClick={() => onSelect(allId)}
        className="flex flex-col items-center gap-1.5 shrink-0 group"
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center bg-beige-100 border-2 transition-all duration-200 ${
            activeCategoryId === allId
              ? "border-gold-500 scale-105"
              : "border-transparent opacity-70 group-hover:opacity-100"
          }`}
        >
          <span className="text-2xl">🍴</span>
        </div>
        <span
          className={`text-xs font-medium whitespace-nowrap transition-colors ${
            activeCategoryId === allId ? "text-dark-800" : "text-text-400"
          }`}
        >
          All
        </span>
      </button>

      {categories.map((cat) => {
        const label =
          cat.translations[language]?.name ??
          Object.values(cat.translations)[0]?.name ??
          "—";
        const isActive = cat.id === activeCategoryId;

        return (
          <button
            key={cat.id}
            ref={isActive ? activeRef : null}
            onClick={() => onSelect(cat.id)}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div
              className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-200 flex items-center justify-center bg-beige-100 ${
                isActive
                  ? "border-gold-500 scale-105"
                  : "border-transparent opacity-70 group-hover:opacity-100"
              }`}
            >
              {cat.iconUrl ? (
                <img
                  src={cat.iconUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">🍽️</span>
              )}
            </div>
            <span
              className={`text-xs font-medium whitespace-nowrap transition-colors ${
                isActive ? "text-dark-800" : "text-text-400"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}