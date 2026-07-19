import { useNavigate } from "react-router-dom";
import type { MenuResponse, RestaurantInfo } from "../../types";
import type { Language } from "../../types/enums";
import { ROUTES } from "../../types/routes";
import { getMenuStrings } from "../../lib/constants/menu-strings";

interface MenuPickerProps {
  slug: string;
  menus: MenuResponse[];
  restaurant?: RestaurantInfo;
  language: Language | null;
  onLanguageChange: (language: Language) => void;
}

function getMenuTitle(menu: MenuResponse, language: Language | null): string {
  if (language) {
    const key = language.toLowerCase();
    const titled = menu.translations[key]?.title ?? menu.translations[language]?.title;
    if (titled) return titled;
  }
  const first = Object.values(menu.translations)[0]?.title;
  return first ?? "Menu";
}

export default function MenuPicker({
  slug,
  menus,
  restaurant,
  language,
  onLanguageChange,
}: MenuPickerProps) {
  const navigate = useNavigate();
  const t = getMenuStrings(language);

  const availableLanguages = menus.length
    ? (Object.keys(menus[0].translations) as Language[])
    : [];

  const activeLanguage =
    language && availableLanguages.includes(language)
      ? language
      : availableLanguages[0] ?? null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "var(--menu-bg)",
        fontFamily: '"Nunito", system-ui, sans-serif',
      }}
    >
      <div className="w-full sm:max-w-md mx-auto px-4 py-8 flex flex-col gap-6 flex-1">
        {restaurant && (
          <div className="flex flex-col items-center text-center gap-3 pt-4">
            {restaurant.logoUrl ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-(--menu-border) shadow-sm">
                <img
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
            <div>
              <h1 className="text-2xl font-bold text-(--menu-primary) menu-font-display">
                {restaurant.name}
              </h1>
              {(restaurant.address || restaurant.ville) && (
                <p className="text-sm text-(--menu-muted) mt-1">
                  {restaurant.address || restaurant.ville}
                </p>
              )}
            </div>
          </div>
        )}

        {availableLanguages.length > 1 && activeLanguage && (
          <div className="flex justify-center gap-2">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onLanguageChange(lang)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  activeLanguage === lang
                    ? "bg-(--menu-accent) text-white"
                    : "bg-(--menu-card) text-(--menu-muted) border border-(--menu-border)"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-lg font-semibold text-(--menu-primary) menu-font-display">
            {t.chooseMenu}
          </h2>
          <p className="text-sm text-(--menu-muted)">{t.chooseMenuHint}</p>
        </div>

        <div className="flex flex-col gap-3">
          {menus.map((menu) => {
            const title = getMenuTitle(menu, activeLanguage);
            const itemCount = menu.totalDishes ?? 0;
            // Use the friendly publicKey (falls back to id) so this matches
            // how QrDisplayPage builds its URLs, and how PublicMenuPage
            // resolves the "?menu=" query param against menu.publicKey.
            const menuKey = menu.publicKey ?? menu.id;

            return (
              <button
                key={menu.id}
                type="button"
                onClick={() =>
                  navigate(ROUTES.publicMenu(slug, menuKey), { replace: true })
                }
                className="group rounded-2xl border border-(--menu-border) bg-(--menu-card) p-5 text-left transition hover:border-(--menu-accent) hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-lg font-semibold text-(--menu-primary) group-hover:text-(--menu-accent) transition">
                      {title}
                    </span>
                    <span className="block text-sm text-(--menu-muted) mt-1">
                      {itemCount}{" "}
                      {itemCount === 1 ? t.item : t.items}
                      {menu.totalCategories
                        ? ` · ${menu.totalCategories} ${t.categoriesLabel}`
                        : ""}
                    </span>
                  </div>
                  <span className="text-(--menu-accent) text-xl opacity-60 group-hover:opacity-100 transition">
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}