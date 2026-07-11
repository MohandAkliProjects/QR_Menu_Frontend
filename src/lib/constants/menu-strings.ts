import type { Language } from "../../types/enums";

export const MENU_STRINGS = {
  en: {
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
    chooseMenu: "Choose a menu",
    chooseMenuHint: "Select the menu you'd like to view",
    categoriesLabel: "categories",
    poweredBy: "Powered by",
    allCategories: "All",
    item: "item",
    items: "items",
    unavailable: "Unavailable",
    shownIn: "Shown in",
    close: "Close",
    like: "Like",
    likes: "likes",
    reviewTitle: "Leave a Review",
    reviewPlaceholder: "Share your experience…",
    reviewHint: "Your review will be copied — just paste it on Google Maps.",
    reviewShareButton: "Share on Google Maps",
    reviewCopied: "Copied! Opening Google Maps…",
  },
  fr: {
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
    chooseMenu: "Choisissez un menu",
    chooseMenuHint: "Sélectionnez le menu que vous souhaitez consulter",
    categoriesLabel: "catégories",
    poweredBy: "Propulsé par",
    allCategories: "Tout",
    item: "article",
    items: "articles",
    unavailable: "Indisponible",
    shownIn: "Affiché en",
    close: "Fermer",
    like: "J'aime",
    likes: "j'aime",
    reviewTitle: "Laisser un avis",
    reviewPlaceholder: "Partagez votre expérience…",
    reviewHint: "Votre avis sera copié — collez-le simplement sur Google Maps.",
    reviewShareButton: "Partager sur Google Maps",
    reviewCopied: "Copié ! Ouverture de Google Maps…",
  },
  ar: {
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
    chooseMenu: "اختر قائمة",
    chooseMenuHint: "حدد القائمة التي تريد عرضها",
    categoriesLabel: "فئات",
    poweredBy: "مدعوم من",
    allCategories: "الكل",
    item: "عنصر",
    items: "عناصر",
    unavailable: "غير متاح",
    shownIn: "معروض بـ",
    close: "إغلاق",
    like: "إعجاب",
    likes: "إعجاب",
    reviewTitle: "اترك تقييمًا",
    reviewPlaceholder: "شاركنا تجربتك…",
    reviewHint: "سيتم نسخ تقييمك — فقط الصقه على خرائط Google.",
    reviewShareButton: "مشاركة على خرائط Google",
    reviewCopied: "تم النسخ! جارٍ فتح خرائط Google…",
  },
} satisfies Record<Language, object>;

export type MenuStrings = (typeof MENU_STRINGS)[Language];

export function getMenuStrings(language: Language | null): MenuStrings {
  if (language && language in MENU_STRINGS) {
    return MENU_STRINGS[language as Language];
  }
  return MENU_STRINGS.en;
}