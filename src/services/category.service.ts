import { apiRequest } from "../api/client";
import type {
  CategoryResponse,
  CreateCategoryRequest,
  ReorderCategoriesRequest,
  UpdateCategoryRequest,
} from "../types";

export async function getCategoriesByMenu(menuId: string): Promise<CategoryResponse[]> {
  return apiRequest<CategoryResponse[]>(`/api/categories/menu/${menuId}`);
}

export async function createCategory(
  menuId: string,
  data: CreateCategoryRequest,
  iconFile?: File | null
): Promise<CategoryResponse> {
  console.log("Sending body:", JSON.stringify(data));
console.log("translations:", data.translations);
  const category = await apiRequest<CategoryResponse>(`/api/categories/menu/${menuId}`, {
    method: "POST",
    body: data,
  });

  if (iconFile) {
    return uploadCategoryIcon(category.id, iconFile);
  }
  return category;
}

export async function updateCategory(
  categoryId: string,
  data: UpdateCategoryRequest,
  iconFile?: File | null
): Promise<CategoryResponse> {
  const category = await apiRequest<CategoryResponse>(`/api/categories/${categoryId}`, {
    method: "PUT",
    body: data,
  });

  if (iconFile) {
    return uploadCategoryIcon(categoryId, iconFile);
  }
  return category;
}

export async function uploadCategoryIcon(
  categoryId: string,
  iconFile: File
): Promise<CategoryResponse> {
  const formData = new FormData();
  formData.append("icon", iconFile);
  return apiRequest<CategoryResponse>(`/api/categories/${categoryId}/icon`, {
    method: "PATCH",
    body: formData,
  });
}

export async function toggleCategoryVisible(categoryId: string): Promise<CategoryResponse> {
  const response = await apiRequest<CategoryResponse>(
    `/api/categories/${categoryId}/toggle-visible`,
    {
      method: "PATCH",
    }
  );

  console.log("TOGGLE RESPONSE:", response);

  return response;
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