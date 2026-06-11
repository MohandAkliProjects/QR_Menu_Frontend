import { apiRequest } from "../api/client";
import type { DishResponse, DishTranslation, FullMenuResponse } from "../types";
import type { DishUI } from "../types/ui";
import { dishUIToTranslations } from "../lib/mappers";

export type DishFormPayload = Partial<DishUI> & {
  imageFile?: File;
  wantToDeleteImage?: boolean;
};

export interface AllDishesResponse {
  menus: FullMenuResponse[];
}

function appendDishFormData(
  formData: FormData,
  ui: DishFormPayload,
  includeImage = true
) {
  const translations = dishUIToTranslations({
    english: ui.english ?? "",
    french: ui.french,
    arabic: ui.arabic,
    description: ui.description,
  });

  for (const [lang, value] of Object.entries(translations) as [
    string,
    DishTranslation,
  ][]) {
    formData.append(`translations[${lang}].name`, value.name);
    if (value.description) {
      formData.append(`translations[${lang}].description`, value.description);
    }
  }

  if (ui.price !== undefined) formData.append("price", String(ui.price));
  if (ui.available !== undefined) {
    formData.append("isAvailable", String(ui.available === "available"));
  }
  if (ui.status !== undefined) {
    formData.append("isVisible", String(ui.status === "visible"));
  }
  if (includeImage && ui.imageFile) {
    formData.append("image", ui.imageFile);
  }
  if (ui.wantToDeleteImage) {
    formData.append("wantToDeleteImage", "true");
  }
}


export async function getAllDishesByRestaurant(
  restaurantId: string
): Promise<AllDishesResponse> {
  return apiRequest<AllDishesResponse>(
    `/api/dishes/restaurant/${restaurantId}`
  );
}

export async function createDish(
  categoryId: string,
  payload: DishFormPayload
): Promise<DishResponse> {
  const formData = new FormData();
  appendDishFormData(formData, payload);
  return apiRequest<DishResponse>(`/api/dishes/category/${categoryId}`, {
    method: "POST",
    body: formData,
  });
}

export async function updateDish(
  dishId: string,
  payload: DishFormPayload
): Promise<DishResponse> {
  const formData = new FormData();
  appendDishFormData(formData, payload, Boolean(payload.imageFile));
  return apiRequest<DishResponse>(`/api/dishes/${dishId}`, {
    method: "PUT",
    body: formData,
  });
}

export async function deleteDish(dishId: string): Promise<void> {
  return apiRequest<void>(`/api/dishes/${dishId}`, { method: "DELETE" });
}

export async function toggleDishVisible(
  dishId: string
): Promise<DishResponse> {
  return apiRequest<DishResponse>(`/api/dishes/${dishId}/toggle-visible`, {
    method: "PATCH",
  });
}

export async function toggleDishAvailable(
  dishId: string
): Promise<DishResponse> {
  return apiRequest<DishResponse>(`/api/dishes/${dishId}/toggle-available`, {
    method: "PATCH",
  });
}