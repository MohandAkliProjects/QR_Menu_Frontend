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
  data: CreateCategoryRequest
): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>(`/api/categories/menu/${menuId}`, {
    method: "POST",
    body: data,
  });
}

export async function updateCategory(
  categoryId: string,
  data: UpdateCategoryRequest
): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>(`/api/categories/${categoryId}`, {
    method: "PUT",
    body: data,
  });
}

export async function toggleCategoryVisible(categoryId: string): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>(`/api/categories/${categoryId}/toggle-visible`, {
    method: "PATCH",
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
