import type { BaseDishRequest } from "../services/dish.service";
import type {
  CategoryResponse,
  CategoryWithDishesResponse,
  DishResponse,
  DishTranslation,
  MenuResponse,
  RestaurantResponse,
  RestaurantUpdateRequest,
  TranslationsMap,
} from "../types/api";
import type { Devise, Language } from "../types/enums";
import type { CategoryUI, DishUI } from "../types/ui";

function getTranslationName(
  translations: TranslationsMap<{ name: string }>,
  lang: string
): string | undefined {
  const upper = lang.toUpperCase() as Language;
  const lower = lang.toLowerCase() as Language;
  return translations[upper]?.name ?? translations[lower]?.name;
}

export function categoryResponseToUI(category: CategoryResponse): CategoryUI {
  const isVisible = category.isVisible ?? category.visible ?? true;

  return {
    id: category.id,
    order: category.order,
    icon: category.iconUrl ?? null,
    english: getTranslationName(category.translations, "EN") ?? "",
    french: getTranslationName(category.translations, "FR"),
    arabic: getTranslationName(category.translations, "AR"),
    status: isVisible ? "visible" : "hidden",
  };
}

export function dishResponseToUI(dish: DishResponse): DishUI {
  const en = dish.translations.en ?? dish.translations["en" as Language];
  console.log("🔥 RAW DISH FROM BACKEND:", dish);

  return {
    id: dish.id,
    order: dish.order,
    image: dish.imageUrl ?? null,
    english: en?.name ?? "",
    french: (dish.translations.fr ?? dish.translations["fr" as Language])?.name,
    arabic: (dish.translations.ar ?? dish.translations["ar" as Language])?.name,
    description: en?.description,
    price: dish.price,
   available: (dish.isAvailable ?? dish.available)
  ? "available"
  : "unavailable",

status: (dish.isVisible ?? dish.visible)
  ? "visible"
  : "hidden",
    likes: dish.likesCount,
    categoryId: dish.categoryId,
  };
}

/*export function dishResponseToUI(dish: DishResponse): DishUI {
  console.log("RAW DISH:", dish);

  const en = dish.translations.en ?? dish.translations["en" as Language];

  return {
    id: dish.id,
    order: dish.order,
    image: dish.imageUrl ?? null,
    english: en?.name ?? "",
    french:
      (dish.translations.fr ??
        dish.translations["fr" as Language])?.name,
    arabic:
      (dish.translations.ar ??
        dish.translations["ar" as Language])?.name,
    description: en?.description,
    price: dish.price,

    available: dish.isAvailable ? "available" : "unavailable",
    status: dish.isVisible ? "visible" : "hidden",

    likes: dish.likesCount,
    categoryId: dish.categoryId,
  };
}*/

export function categoryWithDishesToUI(
  category: CategoryWithDishesResponse
): { category: CategoryUI; dishes: DishUI[] } {
  const isVisible = category.isVisible ?? category.visible ?? true;

  return {
    category: {
      id: category.id,
      order: category.order,
      icon: category.iconUrl ?? null,
      english: getTranslationName(category.translations, "EN") ?? "",
      french: getTranslationName(category.translations, "FR"),
      arabic: getTranslationName(category.translations, "AR"),
      status: isVisible ? "visible" : "hidden",
    },
    dishes: category.dishes.map(dishResponseToUI),
  };
}


export function categoryUIToTranslations(
  ui: Pick<CategoryUI, "english" | "french" | "arabic">
): TranslationsMap<string> {
  const translations: TranslationsMap<string> = {};

  if (ui.english?.trim()) {
    translations["EN" as Language] = ui.english.trim();
  }
  if (ui.french?.trim()) {
    translations["FR" as Language] = ui.french.trim();
  }
  if (ui.arabic?.trim()) {
    translations["AR" as Language] = ui.arabic.trim();
  }

  return translations;
}

export function dishRequestToTranslations(
  request: BaseDishRequest
): TranslationsMap<DishTranslation> {
  const translations: TranslationsMap<DishTranslation> = {};
  if (request.englishName?.trim()) {
    translations["en" as Language] = {
      name: request.englishName.trim(),
      description: request.englishDescription?.trim(),
    };
  }
  if (request.frenchName?.trim()) {
    translations["fr" as Language] = {
      name: request.frenchName.trim(),
      description: request.frenchDescription?.trim(),
    };
  }
  if (request.arabicName?.trim()) {
    translations["ar" as Language] = {
      name: request.arabicName.trim(),
      description: request.arabicDescription?.trim(),
    };
  }
  return translations;
}

function getMenuTranslationTitle(
  translations: MenuResponse["translations"],
  lang: string
): string | undefined {
  const upper = lang.toUpperCase() as Language;
  const lower = lang.toLowerCase() as Language;
  return translations[upper]?.title ?? translations[lower]?.title;
}

export interface MenuFormState {
  english: string;
  french: string;
  arabic: string;
  devise: Devise;
}

export function menuResponseToForm(menu: MenuResponse): MenuFormState {
  return {
    english: getMenuTranslationTitle(menu.translations, "EN") ?? "",
    french: getMenuTranslationTitle(menu.translations, "FR") ?? "",
    arabic: getMenuTranslationTitle(menu.translations, "AR") ?? "",
    devise: menu.devise,
  };
}


export function menuFormToUpdateRequest(
  form: MenuFormState,
  supportedLanguages: string[]
) {
  const translations: Record<string, string> = {};

  if (supportedLanguages.includes("EN") && form.english.trim())
    translations.en = form.english.trim();
  if (supportedLanguages.includes("FR") && form.french.trim())
    translations.fr = form.french.trim();
  if (supportedLanguages.includes("AR") && form.arabic.trim())
    translations.ar = form.arabic.trim();

  return { translations, devise: form.devise };
}

export function restaurantResponseToForm(restaurant: RestaurantResponse) {
  const socials: { id: number; platform: string; url: string }[] = [];
  let socialId = 1;

  const pushSocial = (platform: string, url?: string) => {
    if (url) socials.push({ id: socialId++, platform, url });
  };

  pushSocial("FaceBook", restaurant.facebookLink);
  pushSocial("Instagram", restaurant.instagramLink);
  pushSocial("TikTok", restaurant.tiktokLink);
 // pushSocial("WebSite", restaurant.googleMapsLink);
  pushSocial("Google Maps", restaurant.googleMapsLink);
  pushSocial("Snapchat", restaurant.snapchatLink);

  return {
    restaurantName: restaurant.name,
    email: restaurant.emailAddress,
    password: "············",
    address: restaurant.address ?? "",
    city: restaurant.ville,
    phones: (restaurant.phones ?? []).map((value, index) => ({
      id: index + 1,
      value,
    })),
    socials,
    logoUrl: restaurant.logoUrl ?? null,
  };
}

export function restaurantFormToUpdateRequest(
  form: {
    restaurantName: string;
    emailAddress: string;
    address: string;
    city: string;
    phones: { value: string }[];
    socials: { platform: string; url: string }[];
  }
): RestaurantUpdateRequest {
  const request: RestaurantUpdateRequest = {};

  if (form.restaurantName?.trim()) request.restaurantName = form.restaurantName.trim();
  if (form.city?.trim()) request.ville = form.city.trim();
  if (form.address?.trim()) request.address = form.address.trim();
  if (form.emailAddress?.trim()) request.emailAddress = form.emailAddress.trim();

  const validPhones = form.phones.map((p) => p.value.trim()).filter(Boolean);
  if (validPhones.length > 0) request.phones = validPhones;

  for (const social of form.socials) {
    const url = social.url.trim();
    if (!url) continue;
    if (social.platform === "FaceBook") request.facebookLink = url;
    if (social.platform === "Instagram") request.instagramLink = url;
    if (social.platform === "TikTok") request.tiktokLink = url;
    //if (social.platform === "WebSite") request.googleMapsLink = url;
    if (social.platform === "Google Maps") request.googleMapsLink = url;
    if (social.platform === "Snapchat") request.snapchatLink = url;
  }

  return request;
}