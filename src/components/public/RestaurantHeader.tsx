import type { RestaurantInfo } from "../../types/api";
import type { Language } from "../../types/enums";

interface RestaurantHeaderProps {
  restaurant: RestaurantInfo;
  menuTitle: string;
  availableLanguages: Language[];
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "EN",
  fr: "FR",
  ar: "AR",
};

/**
 * Replaces the Figma `RestaurantHeader`. Dropped vs. the Figma version:
 * - star rating / review count (no such field on RestaurantInfo)
 * - "Open now / Closes at ..." status (no opening hours in the API yet)
 *
 * Added: a language switcher (EN/FR/AR pills) driven by the menu's
 * available translations, and the menu's own title as a small eyebrow
 * label above the restaurant name.
 */
function RestaurantHeader({
  restaurant,
  menuTitle,
  availableLanguages,
  selectedLanguage,
  onLanguageChange,
}: RestaurantHeaderProps) {
  const location = restaurant.address || restaurant.ville;

  return (
    <div className="flex items-start gap-4">
      {restaurant.logoUrl ? (
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-[var(--menu-border)] shadow-sm bg-[var(--menu-card)]">
          <img
            src={restaurant.logoUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-2xl flex-shrink-0 border border-[var(--menu-border)] shadow-sm bg-[var(--menu-secondary)] flex items-center justify-center">
          <span className="text-xl font-bold text-[var(--menu-primary)] menu-font-display">
            {restaurant.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        {menuTitle && (
          <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--menu-accent)] uppercase mb-0.5">
            {menuTitle}
          </p>
        )}
        <h1 className="text-lg font-semibold text-[var(--menu-primary)] leading-tight menu-font-display">
          {restaurant.name}
        </h1>
        {location && (
          <p className="text-[13px] text-[var(--menu-muted)] mt-0.5 line-clamp-1">
            {location}
          </p>
        )}
      </div>

      {availableLanguages.length > 1 && (
        <div className="flex gap-1 flex-shrink-0">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => onLanguageChange(lang)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                lang === selectedLanguage
                  ? "bg-[var(--menu-primary)] text-white"
                  : "bg-[var(--menu-secondary)] text-[var(--menu-primary)]"
              }`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantHeader;