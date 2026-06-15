import { useEffect, useRef } from "react";
import { LayoutGrid } from "lucide-react";

import type { CategoryWithDishesResponse } from "../../types/api";
import type { Language } from "../../types/enums";
import { getCategoryName } from "../../utils/menu-display";

interface CategoryFilterProps {
  categories: CategoryWithDishesResponse[];
  activeCategoryId: string;
  language: Language;
  onSelect: (id: string) => void;
  allId: string;
}

const ACTIVE_RING = "0 0 0 2.5px var(--menu-accent), 0 3px 12px rgba(182,141,55,0.35)";
const INACTIVE_RING = "0 2px 6px rgba(0,0,0,0.08)";

/**
 * Returns the language key that was actually used for the fallback,
 * or null if the requested language was available.
 */
function getFallbackLanguage(
  translations: Partial<Record<Language, { name: string }>>,
  language: Language
): Language | null {
  if (translations[language]) return null;
  const fallback = Object.keys(translations)[0] as Language | undefined;
  return fallback ?? null;
}

function CategoryFilter({ categories, activeCategoryId, language, onSelect, allId }: CategoryFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current?.querySelector(
      `[data-catid="${activeCategoryId}"]`
    ) as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeCategoryId]);

  return (
    // py-2 + px-1 give the scaled-up pill room to breathe without clipping.
    // overflow-x-auto on the outer wrapper, overflow-visible on the inner
    // flex row so the box-shadow / scale transform aren't cut off.
    <div
      ref={containerRef}
      className="overflow-x-auto menu-scroll-x"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="flex gap-3 px-1 py-2 w-max">
        {/* "All" pill */}
        <button
          type="button"
          data-catid={allId}
          onClick={() => onSelect(allId)}
          className="flex flex-col items-center gap-1 flex-shrink-0 transition-all duration-200"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 bg-[var(--menu-secondary)]"
            style={{
              boxShadow: activeCategoryId === allId ? ACTIVE_RING : INACTIVE_RING,
              transform: activeCategoryId === allId ? "scale(1.1)" : "scale(1)",
            }}
          >
            <LayoutGrid className="w-5 h-5 text-[var(--menu-primary)]" />
          </div>
          <p
            className="text-[11px] font-bold whitespace-nowrap transition-colors duration-200"
            style={{ color: activeCategoryId === allId ? "var(--menu-accent)" : "var(--menu-primary)" }}
          >
            All
          </p>
        </button>

        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;
          const name = getCategoryName(category, language);
          const fallbackLang = getFallbackLanguage(category.translations, language);

          return (
            <button
              key={category.id}
              type="button"
              data-catid={category.id}
              onClick={() => onSelect(category.id)}
              className="flex flex-col items-center gap-1 flex-shrink-0 transition-all duration-200"
            >
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center transition-all duration-200 bg-[var(--menu-secondary)]"
                  style={{
                    boxShadow: isActive ? ACTIVE_RING : INACTIVE_RING,
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {category.iconUrl ? (
                    <img src={category.iconUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-[var(--menu-primary)]">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Language fallback badge */}
                {fallbackLang && (
                  <span
                    className="absolute -bottom-0.5 -end-1 px-1 rounded text-[8px] font-bold uppercase leading-tight"
                    style={{
                      background: "var(--menu-accent)",
                      color: "#fff",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {fallbackLang}
                  </span>
                )}
              </div>

              <p
                className="text-[11px] font-bold whitespace-nowrap transition-colors duration-200 max-w-[64px] truncate"
                style={{ color: isActive ? "var(--menu-accent)" : "var(--menu-primary)" }}
              >
                {name}
              </p>
              <p className="text-[9px] text-[var(--menu-muted)] -mt-0.5">
                {category.dishes.length} {category.dishes.length === 1 ? "item" : "items"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryFilter;