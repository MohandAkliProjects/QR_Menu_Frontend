import { apiRequest } from "../api/client";
import type { DishResponse, DishTranslation, FullMenuResponse } from "../types";
import { dishRequestToTranslations } from "../lib/mappers";
import { dataUrlToFile, isDataUrl } from "../lib/files";
import type {
  CreateDishRequest,
  UpdateDishRequest,
} from "../types/api";


export interface AllDishesResponse {
  menus: FullMenuResponse[];
}

function appendSizesFormData(formData: FormData, sizes: { name: string; price: number }[]) {
  sizes.forEach((size, index) => {
    formData.append(`sizes[${index}].name`, size.name);
    formData.append(`sizes[${index}].price`, String(size.price));
  });
}

function appendCreateDishFormData (
  request: CreateDishRequest,
): FormData {

  const formData: FormData = new FormData();

  const translations = dishRequestToTranslations(request);

  for (const [lang, value] of Object.entries(translations) as [
    string,
    DishTranslation,
  ][]) {
    formData.append(`translations[${lang}].name`, value.name);
    if (value.description) {
      formData.append(`translations[${lang}].description`, value.description);
    }
  }

  appendSizesFormData(formData, request.sizes);

  formData.append("isAvailable", String(request.available));

  formData.append("isVisible", String(request.visible));


  if (request.image && isDataUrl(request.image)) {
    formData.append("image", dataUrlToFile(request.image, "dish-image.png"));
  }

  return formData;
}

function appendUpdateDishFormData(
  request: UpdateDishRequest
): FormData {
  const formData = new FormData();
  const translations = dishRequestToTranslations(request);

  for (const [lang, value] of Object.entries(translations) as [
    string,
    DishTranslation,
  ][]) {
    formData.append(`translations[${lang}].name`, value.name);
    if (value.description) {
      formData.append(`translations[${lang}].description`, value.description);
    }
  }

  appendSizesFormData(formData, request.sizes);

  formData.append("isAvailable", String(request.available));

  formData.append("isVisible", String(request.visible));

  if (request.image && isDataUrl(request.image)) {
    formData.append("image", dataUrlToFile(request.image, "dish-image.png"));
  }

  if (request.wantToDeleteImage) {
    formData.append("wantToDeleteImage", "true");
  }

  return formData;
}

export async function getAllDishesByRestaurant(
  restaurantId: string,
): Promise<AllDishesResponse> {
  return apiRequest<AllDishesResponse>(
    `/api/dishes/restaurant/${restaurantId}`,
  );
}

export async function createDish(
  payload: CreateDishRequest,
): Promise<DishResponse> {
  const formData = appendCreateDishFormData(payload);
  return apiRequest<DishResponse>(`/api/dishes/category/${payload.categoryId}`, {
    method: "POST",
    body: formData,
  });
}

export async function updateDish(
  payload: UpdateDishRequest,
): Promise<DishResponse> {
  const formData = appendUpdateDishFormData(payload);
  return apiRequest<DishResponse>(`/api/dishes/${payload.dishId}`, {
    method: "PUT",
    body: formData,
  });
}

export async function deleteDish(dishId: string): Promise<void> {
  return apiRequest<void>(`/api/dishes/${dishId}`, { method: "DELETE" });
}

export async function toggleDishVisible(dishId: string): Promise<DishResponse> {
  return apiRequest<DishResponse>(`/api/dishes/${dishId}/toggle-visible`, {
    method: "PATCH",
  });
}

export async function toggleDishAvailable(
  dishId: string,
): Promise<DishResponse> {
  return apiRequest<DishResponse>(`/api/dishes/${dishId}/toggle-available`, {
    method: "PATCH",
  });
}

export async function reorderDishes(
  categoryId: string,
  payload: { orderedDishesIds: string[] },
): Promise<DishResponse[]> {
  return apiRequest<DishResponse[]>(
    `/api/dishes/category/${categoryId}/reorderDishes`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}