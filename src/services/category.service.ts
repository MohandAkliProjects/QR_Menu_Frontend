import { apiRequest } from "../api/client";
import type {
  CategoryResponse,
  CreateCategoryRequest,
  ReorderCategoriesRequest,
  UpdateCategoryRequest,
  AllCategoriesResponse,
} from "../types/api";
import type { Language } from "../types/enums";

function appendCategoryFormData(
  formData: FormData,
  data: {
    translations?: Record<string, string>;
    isVisible?: boolean;
  },
  iconFile?: File | null,
  wantToDeleteIcon?: boolean
) {
  if (data.translations) {
    for (const [lang, value] of Object.entries(data.translations)) {
      if (typeof value === "string" && value.trim()) {
        formData.append(`translations[${lang.toLowerCase()}]`, value.trim());
      }
    }
  }

  if (data.isVisible !== undefined) {
    formData.append("isVisible", String(data.isVisible));
  }

  if (iconFile) {
    formData.append("icon", iconFile);
  }

  if (wantToDeleteIcon) {
    formData.append("wantToDeleteIcon", "true");
  }
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
  menuId: string,
  data: CreateCategoryRequest,
  iconFile?: File | null
): Promise<CategoryResponse> {
  const formData = new FormData();
  appendCategoryFormData(formData, data, iconFile);

  return apiRequest<CategoryResponse>(`/api/categories/menu/${menuId}`, {
    method: "POST",
    body: formData,
  });
}


export async function updateCategory(
  categoryId: string,
  data: UpdateCategoryRequest,
  iconFile?: File | null,
  wantToDeleteIcon?: boolean
): Promise<CategoryResponse> {
  const formData = new FormData();
  appendCategoryFormData(formData, data, iconFile, wantToDeleteIcon);

  return apiRequest<CategoryResponse>(`/api/categories/menu/${categoryId}`, {
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