import { apiRequest } from "../api/client";
import type {
  AllSupplementsResponse,
  SupplementResponse,
  CreateSupplementRequest,
  UpdateSupplementRequest,
  SupplementTranslation,
} from "../types/api";
import type { Language } from "../types/enums";
import { supplementRequestToTranslations } from "../lib/mappers";

function appendCreateSupplementFormData(
  request: CreateSupplementRequest,
): FormData {
  const formData = new FormData();
  const translations = supplementRequestToTranslations(request);

  for (const [lang, value] of Object.entries(translations) as [
    string,
    SupplementTranslation,
  ][]) {
    formData.append(`translations[${lang}].name`, value.name);
  }

  formData.append("price", String(request.price));
  formData.append("isAvailable", String(request.available));
  formData.append("isVisible", String(request.visible));

  return formData;
}

function appendUpdateSupplementFormData(
  request: UpdateSupplementRequest,
): FormData {
  const formData = new FormData();
  const translations = supplementRequestToTranslations(request);

  for (const [lang, value] of Object.entries(translations) as [
    string,
    SupplementTranslation,
  ][]) {
    formData.append(`translations[${lang}].name`, value.name);
  }

  formData.append("price", String(request.price));
  formData.append("isAvailable", String(request.available));
  formData.append("isVisible", String(request.visible));

  return formData;
}

export async function getAllSupplementsByRestaurant(
  restaurantId: string,
): Promise<AllSupplementsResponse> {
  return apiRequest<AllSupplementsResponse>(
    `/api/supplements/restaurant/${restaurantId}`,
  );
}

export async function loadSupplementsPageData(
  restaurantId: string,
  menuId: string,
): Promise<{ supplements: SupplementResponse[]; supportedLanguages: Language[] }> {
  const data = await getAllSupplementsByRestaurant(restaurantId);

  const activeMenu = data.menus.find((m) => m.id === menuId);

  const supplements = activeMenu?.supplements ?? [];

  const supportedLanguages = activeMenu
    ? (Object.keys(activeMenu.translations).map((k) => k.toUpperCase()) as Language[])
    : [];

  return { supplements, supportedLanguages };
}

export async function createSupplement(
  data: CreateSupplementRequest,
): Promise<SupplementResponse> {
  const formData = appendCreateSupplementFormData(data);
  return apiRequest<SupplementResponse>(`/api/supplements/menu/${data.menuId}`, {
    method: "POST",
    body: formData,
  });
}

export async function updateSupplement(
  data: UpdateSupplementRequest,
): Promise<SupplementResponse> {
  const formData = appendUpdateSupplementFormData(data);
  return apiRequest<SupplementResponse>(`/api/supplements/${data.supplementId}`, {
    method: "PUT",
    body: formData,
  });
}

export async function deleteSupplement(supplementId: string): Promise<void> {
  return apiRequest<void>(`/api/supplements/${supplementId}`, {
    method: "DELETE",
  });
}

export async function toggleSupplementVisible(
  supplementId: string,
): Promise<SupplementResponse> {
  return apiRequest<SupplementResponse>(
    `/api/supplements/${supplementId}/toggle-visible`,
    { method: "PATCH" },
  );
}

export async function toggleSupplementAvailable(
  supplementId: string,
): Promise<SupplementResponse> {
  return apiRequest<SupplementResponse>(
    `/api/supplements/${supplementId}/toggle-available`,
    { method: "PATCH" },
  );
}

export async function addSupplementToDish(
  supplementId: string,
  dishId: string,
): Promise<void> {
  return apiRequest<void>(
    `/api/supplements/dish/${dishId}/add/${supplementId}`,
    { method: "PATCH" },
  );
}

export async function removeSupplementFromDish(
  supplementId: string,
  dishId: string,
): Promise<void> {
  return apiRequest<void>(
    `/api/supplements/dish/${dishId}/remove/${supplementId}`,
    { method: "PATCH" },
  );
}