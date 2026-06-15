import type {
  CategoryResponse,
  CategoryWithDishesResponse,
  DishResponse,
} from "../types/api";
import type { Devise, Language } from "../types/enums";

/**
 * Currency symbols/labels shown next to prices.
 * Edit these if you'd rather show ISO codes (e.g. "DZD" instead of "DA").
 */
const CURRENCY_LABELS: Record<Devise, string> = {
  dzd: "DA",
  eur: "€",
  usd: "$",
  gbp: "£",
  sar: "SAR",
  aed: "AED",
  try: "₺",
  cad: "CA$",
  chf: "CHF",
  cny: "¥",
};

/** Formats a price using the menu's devise, e.g. "1 200 DA" or "$12". */
export function formatPrice(price: number, devise: Devise): string {
  const label = CURRENCY_LABELS[devise] ?? devise.toUpperCase();
  return `${price.toLocaleString()} ${label}`;
}

/** Arabic is the only RTL language we currently support. */
export function isRTL(language: Language | null): boolean {
  return language === "ar";
}

type NamedTranslation = { name: string };

function pickTranslation<T extends NamedTranslation>(
  translations: Partial<Record<Language, T>>,
  language: Language
): T | undefined {
  return translations[language] ?? Object.values(translations)[0];
}

/** Category name in the active language, falling back to any available one. */
export function getCategoryName(
  category: CategoryResponse | CategoryWithDishesResponse,
  language: Language
): string {
  return pickTranslation(category.translations, language)?.name ?? "";
}

/** Dish name/description in the active language, with a same fallback. */
export function getDishText(
  dish: DishResponse,
  language: Language
): { name: string; description?: string } {
  const translation = pickTranslation(dish.translations, language);
  return {
    name: translation?.name ?? "",
    description: translation?.description,
  };
}

/**
 * isAvailable/available is a deprecated pair on DishResponse - some backend
 * responses may still only populate the old field. Prefer the new one.
 */
export function isDishAvailable(dish: DishResponse): boolean {
  return dish.isAvailable ?? dish.available ?? true;
}

export function isDishVisible(dish: DishResponse): boolean {
  return dish.isVisible ?? dish.visible ?? true;
}

export function isCategoryVisible(
  category: CategoryResponse | CategoryWithDishesResponse
): boolean {
  return category.isVisible ?? category.visible ?? true;
}