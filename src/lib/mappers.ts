import type {
  CategoryResponse,
  CategoryWithDishesResponse,
  DishResponse,
  DishTranslation,
  RestaurantResponse,
  RestaurantUpdateRequest,
  TranslationsMap,
} from "../types/api";
import type { Language } from "../types/enums";
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
   console.log("MAPPING CATEGORY:", category);

  return {
    id: category.id,
    order: category.order,
    icon: category.iconUrl ?? null,
    english: getTranslationName(category.translations, "EN") ?? "",
    french: getTranslationName(category.translations, "FR"),
    arabic: getTranslationName(category.translations, "AR"),
    status: category.visible ? "visible" : "hidden",
  };
}

export function dishResponseToUI(dish: DishResponse): DishUI {
  const en = dish.translations.EN ?? dish.translations["en" as Language];
  return {
    id: dish.id,
    order: dish.order,
    image: dish.imageUrl ?? null,
    english: en?.name ?? "",
    french: (dish.translations.FR ?? dish.translations["fr" as Language])?.name,
    arabic: (dish.translations.AR ?? dish.translations["ar" as Language])?.name,
    description: en?.description,
    price: dish.price,
    available: dish.isAvailable ? "available" : "unavailable",
    status: dish.isVisible ? "visible" : "hidden",
    likes: dish.likes,
    categoryId: dish.categoryId,
  };
}

export function categoryWithDishesToUI(
  category: CategoryWithDishesResponse
): { category: CategoryUI; dishes: DishUI[] } {
  return {
    category: {
      id: category.id,
      order: category.order,
      icon: category.iconUrl ?? null,
      english: getTranslationName(category.translations, "EN") ?? "",
      french: getTranslationName(category.translations, "FR"),
      arabic: getTranslationName(category.translations, "AR"),
      status: category.visible ? "visible" : "hidden",
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

export function dishUIToTranslations(
  ui: Pick<DishUI, "english" | "french" | "arabic" | "description">
): TranslationsMap<DishTranslation> {
  const translations: TranslationsMap<DishTranslation> = {};
  if (ui.english.trim()) {
    translations["en" as Language] = {
      name: ui.english.trim(),
      description: ui.description?.trim() || undefined,
    };
  }
  if (ui.french?.trim()) {
    translations["fr" as Language] = {
      name: ui.french.trim(),
      description: ui.description?.trim(),
    };
  }
  if (ui.arabic?.trim()) {
    translations["ar" as Language] = {
      name: ui.arabic.trim(),
      description: ui.description?.trim(),
    };
  }
  return translations;
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
  pushSocial("WebSite", restaurant.googleMapsLink);

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
    if (social.platform === "WebSite") request.googleMapsLink = url;
    if (social.platform === "Snapchat") request.snapshatLink = url;
  }

  return request;
}