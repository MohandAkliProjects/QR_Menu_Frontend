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

const SOCIAL_FIELD_MAP: Record<string, keyof RestaurantUpdateRequest> = {
  FaceBook: "facebookLink",
  Instagram: "instagramLink",
  TikTok: "tiktokLink",
  WebSite: "googleMapsLink",
};

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
    socials: socials.length
      ? socials
      : [{ id: 1, platform: "FaceBook", url: "" }],
    logoUrl: restaurant.logoUrl ?? null,
  };
}

export function restaurantFormToUpdateRequest(
  form: {
    restaurantName: string;
    email: string;
    address: string;
    city: string;
    phones: { value: string }[];
    socials: { platform: string; url: string }[];
  }
): RestaurantUpdateRequest {
  const request: RestaurantUpdateRequest = {
    restaurantName: form.restaurantName,
    ville: form.city,
    address: form.address || undefined,
    phones: form.phones.map((p) => p.value).filter(Boolean),
    emailAddress: form.email,
  };

  for (const social of form.socials) {
    const field = SOCIAL_FIELD_MAP[social.platform];
    if (!field || !social.url.trim()) continue;
    if (field === "facebookLink") request.facebookLink = social.url.trim();
    if (field === "instagramLink") request.instagramLink = social.url.trim();
    if (field === "tiktokLink") request.tiktokLink = social.url.trim();
    if (field === "googleMapsLink") request.googleMapsLink = social.url.trim();
  }

  return request;
}
