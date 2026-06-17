import type { Language } from "../../types/enums";

export const MENU_STRINGS = {
  EN: {
    loading: "Loading menu…",
    notFound: "Menu not found or unavailable.",
    noResults: "No results found",
    noResultsHint: "Try a different search term",
    noDishes: "No dishes available at the moment.",
    noItemsTitle: "No items available",
    noItemsMessage: "No dishes available in this category.",
    noItemsHint: "Please check another category or come back later.",
    searchResults: (count: number, term: string) =>
      `${count} result${count !== 1 ? "s" : ""} for "${term}"`,
    searchPlaceholder: "Search dishes…",
    closed: "We're Currently Closed",
    closedMessage:
      "This restaurant's menu is not available right now. Please check back later or contact the restaurant directly.",
    poweredBy: "Powered by",
  },
  FR: {
    loading: "Chargement du menu…",
    notFound: "Menu introuvable ou indisponible.",
    noResults: "Aucun résultat",
    noResultsHint: "Essayez un autre terme de recherche",
    noDishes: "Aucun plat disponible pour le moment.",
    noItemsTitle: "Aucun article disponible",
    noItemsMessage: "Aucun plat disponible dans cette catégorie.",
    noItemsHint: "Consultez une autre catégorie ou revenez plus tard.",
    searchResults: (count: number, term: string) =>
      `${count} résultat${count !== 1 ? "s" : ""} pour "${term}"`,
    searchPlaceholder: "Rechercher un plat…",
    closed: "Nous sommes actuellement fermés",
    closedMessage:
      "Le menu de ce restaurant n'est pas disponible pour le moment. Revenez plus tard ou contactez le restaurant directement.",
    poweredBy: "Propulsé par",
  },
  AR: {
    loading: "جارٍ تحميل القائمة…",
    notFound: "القائمة غير موجودة أو غير متاحة.",
    noResults: "لا توجد نتائج",
    noResultsHint: "جرّب كلمة بحث مختلفة",
    noDishes: "لا توجد أطباق متاحة في الوقت الحالي.",
    noItemsTitle: "لا توجد عناصر متاحة",
    noItemsMessage: "لا توجد أطباق متاحة في هذه الفئة.",
    noItemsHint: "تحقق من فئة أخرى أو عد لاحقاً.",
    searchResults: (count: number, term: string) =>
      `${count} نتيجة للبحث عن "${term}"`,
    searchPlaceholder: "ابحث عن طبق…",
    closed: "نحن مغلقون حالياً",
    closedMessage:
      "قائمة هذا المطعم غير متاحة الآن. يرجى المراجعة لاحقاً أو التواصل مع المطعم مباشرة.",
    poweredBy: "مدعوم من",
  },
} satisfies Record<string, object>;

export type MenuStrings = (typeof MENU_STRINGS)[keyof typeof MENU_STRINGS];

export function getMenuStrings(language: Language | null): MenuStrings {
  return MENU_STRINGS[(language ?? "EN") as keyof typeof MENU_STRINGS] ?? MENU_STRINGS.EN;
}