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

function getName(
  translations: TranslationsMap<{ name: string }>,
  lang: Language
): string | undefined {
  return translations[lang]?.name;
}

export function categoryResponseToUI(category: CategoryResponse): CategoryUI {
  return {
    id: category.id,
    order: category.order,
    icon: category.iconUrl ?? null,
    english: getName(category.translations, "EN") ?? "",
    french: getName(category.translations, "FR"),
    arabic: getName(category.translations, "AR"),
    status: category.isVisible ? "visible" : "hidden",
  };
}

export function dishResponseToUI(dish: DishResponse): DishUI {
  const en = dish.translations.EN;
  return {
    id: dish.id,
    order: dish.order,
    image: dish.imageUrl ?? null,
    english: en?.name ?? "",
    french: dish.translations.FR?.name,
    arabic: dish.translations.AR?.name,
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
      english: getName(category.translations, "EN") ?? "",
      french: getName(category.translations, "FR"),
      arabic: getName(category.translations, "AR"),
      status: category.isVisible ? "visible" : "hidden",
    },
    dishes: category.dishes.map(dishResponseToUI),
  };
}

export function categoryUIToTranslations(
  ui: Pick<CategoryUI, "english" | "french" | "arabic">
): TranslationsMap<string> {
  const translations: TranslationsMap<string> = {};
  if (ui.english.trim()) translations.EN = ui.english.trim();
  if (ui.french?.trim()) translations.FR = ui.french.trim();
  if (ui.arabic?.trim()) translations.AR = ui.arabic.trim();
  return translations;
}

export function dishUIToTranslations(
  ui: Pick<DishUI, "english" | "french" | "arabic" | "description">
): TranslationsMap<DishTranslation> {
  const translations: TranslationsMap<DishTranslation> = {};
  if (ui.english.trim()) {
    translations.EN = {
      name: ui.english.trim(),
      description: ui.description?.trim() || undefined,
    };
  }
  if (ui.french?.trim()) {
    translations.FR = { name: ui.french.trim(), description: ui.description?.trim() };
  }
  if (ui.arabic?.trim()) {
    translations.AR = { name: ui.arabic.trim(), description: ui.description?.trim() };
  }
  return translations;
}

/*const SOCIAL_FIELD_MAP: Record<string, keyof RestaurantUpdateRequest> = {
  FaceBook: "facebookLink",
  Instagram: "instagramLink",
  TikTok: "tiktokLink",
  WebSite: "googleMapsLink",
};*/

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
    socials: socials,
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

  // Only send if not empty
  if (form.restaurantName?.trim()) request.restaurantName = form.restaurantName.trim();
  if (form.city?.trim()) request.ville = form.city.trim();
  if (form.address?.trim()) request.address = form.address.trim();
  if (form.emailAddress?.trim()) request.emailAddress = form.emailAddress.trim();

  // Only send phones if there are valid ones
  const validPhones = form.phones.map((p) => p.value.trim()).filter(Boolean);
  if (validPhones.length > 0) request.phones = validPhones;

  // Social links — only send if url is filled
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
