import { apiRequest } from "../api/client";
import type {
  CategoryResponse,
  CreateCategoryRequest,
  ReorderCategoriesRequest,
  UpdateCategoryRequest,
  AllCategoriesResponse
} from "../types/api";
import type { Language } from "../types/enums";
import { categoryRequestToTranslations } from "../lib/mappers";
import { dataUrlToFile, isDataUrl } from "../lib/files";



function appendCreateCategoryFormData(
  request: CreateCategoryRequest
): FormData {
  const formData = new FormData()

  const translations = categoryRequestToTranslations(request);

  for (const [lang, value] of Object.entries(translations) as [
      string,
      string,
    ][]) {
      formData.append(`translations[${lang.toLowerCase()}]`, value);
    }

  if (request.visible !== undefined) {
    formData.append("isVisible", String(request.visible));
  }

  if (request.image && isDataUrl(request.image)) {
      formData.append("icon", dataUrlToFile(request.image, "category-image.png"));
    }

  return formData;
}

function appendUpdateCategoryFormData(
  request: UpdateCategoryRequest
): FormData {
  const formData = new FormData()

  const translations = categoryRequestToTranslations(request);

  for (const [lang, value] of Object.entries(translations) as [
      string,
      string,
    ][]) {
      formData.append(`translations[${lang.toLowerCase()}]`, value);
    }

  if (request.visible !== undefined) {
    formData.append("isVisible", String(request.visible));
  }

  if (request.wantToDeleteImage !== undefined) {
    formData.append("wantToDeleteIcon", String(request.wantToDeleteImage));
  }

  if (request.image && isDataUrl(request.image)) {
      formData.append("icon", dataUrlToFile(request.image, "category-image.png"));
    }

  return formData;
}


export async function getAllCategoriesByRestaurant(
  restaurantId: string
): Promise<AllCategoriesResponse> {
  return apiRequest<AllCategoriesResponse>(
    `/api/categories/restaurant/${restaurantId}`
  );
}


export async function loadCategoriesPageData(
  restaurantId: string,
  menuId: string
): Promise<{ categories: CategoryResponse[]; supportedLanguages: Language[] }> {
  const data = await getAllCategoriesByRestaurant(restaurantId);

  const activeMenu = data.menus.find((m) => m.id === menuId);

  const categories = activeMenu?.categories ?? [];

  const supportedLanguages = activeMenu
    ? (Object.keys(activeMenu.translations).map((k) => k.toUpperCase()) as Language[])
    : [];

  return { categories, supportedLanguages };
}

export async function createCategory(
  data: CreateCategoryRequest,
): Promise<CategoryResponse> {

  const formData = appendCreateCategoryFormData(data);

  return apiRequest<CategoryResponse>(`/api/categories/menu/${data.menuId}`, {
    method: "POST",
    body: formData,
  });
}


export async function updateCategory(
  data: UpdateCategoryRequest,
): Promise<CategoryResponse> {
  const formData = appendUpdateCategoryFormData(data);

  return apiRequest<CategoryResponse>(`/api/categories/menu/${data.categoryId}`, {
    method: "PUT",
    body: formData,
  });
}


export async function toggleCategoryVisible(
  categoryId: string
): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>(
    `/api/categories/${categoryId}/toggle-visible`,
    { method: "PATCH" }
  );
}


export async function deleteCategory(categoryId: string): Promise<void> {
  return apiRequest<void>(`/api/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export async function reorderCategories(
  menuId: string,
  data: ReorderCategoriesRequest
): Promise<CategoryResponse[]> {
  return apiRequest<CategoryResponse[]>(
    `/api/categories/menu/${menuId}/reorderCategories`,
    { method: "PATCH", body: data }
  );
}