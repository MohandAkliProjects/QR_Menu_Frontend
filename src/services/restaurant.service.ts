import { apiRequest } from "../api/client";
import type {
  BannerResponse,
  RestaurantResponse,
  RestaurantUpdateRequest,
} from "../types";

export async function getRestaurant(restaurantId: string): Promise<RestaurantResponse> {
  return apiRequest<RestaurantResponse>(`/api/restaurants/${restaurantId}`);
}

export async function updateRestaurant(
  restaurantId: string,
  data: RestaurantUpdateRequest
): Promise<RestaurantResponse> {
  return apiRequest<RestaurantResponse>(`/api/restaurants/${restaurantId}`, {
    method: "PUT",
    body: data,
  });
}

export async function getBanners(restaurantId: string): Promise<BannerResponse[]> {
  return apiRequest<BannerResponse[]>(`/api/restaurants/${restaurantId}/banners`);
}

export async function addBanner(
  restaurantId: string,
  image: File
): Promise<BannerResponse[]> {
  const formData = new FormData();
  formData.append("image", image);
  return apiRequest<BannerResponse[]>(`/api/restaurants/${restaurantId}/banners`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteBanner(
  restaurantId: string,
  bannerId: string
): Promise<BannerResponse[]> {
  return apiRequest<BannerResponse[]>(
    `/api/restaurants/${restaurantId}/banners/${bannerId}`,
    { method: "DELETE" }
  );
}


export async function uploadLogo(
  restaurantId: string,
  image: File
): Promise<RestaurantResponse> {
  const formData = new FormData();
  formData.append("image", image);
  return apiRequest<RestaurantResponse>(
    `/api/restaurants/${restaurantId}/logo`,
    { method: "POST", body: formData }
  );
}
