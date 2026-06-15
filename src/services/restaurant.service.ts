import { apiRequest } from "../api/client";
import type {
  BannersResponse,
  RestaurantDashboardStatsResponse,
  RestaurantResponse,
  RestaurantUpdateRequest,
} from "../types";

export async function getRestaurant(restaurantId: string): Promise<RestaurantResponse> {
  return apiRequest<RestaurantResponse>(`/api/restaurants/${restaurantId}`);
}

export async function getDashboardStats(
  restaurantId: string
): Promise<RestaurantDashboardStatsResponse> {
  return apiRequest<RestaurantDashboardStatsResponse>(
    `/api/restaurants/${restaurantId}/dashboard`
  );
}

export async function updateRestaurant(
  restaurantId: string,
  data: RestaurantUpdateRequest,
  logoFile?: File | null,
  deleteLogo?: boolean,
  publicImageFile?: File | null,
  deletePublicImage?: boolean
): Promise<RestaurantResponse> {
  const formData = new FormData();

  if (data.restaurantName) formData.append("restaurantName", data.restaurantName);
  if (data.ville) formData.append("ville", data.ville);
  if (data.address) formData.append("address", data.address);
  if (data.emailAddress) formData.append("emailAddress", data.emailAddress);
  if (data.instagramLink) formData.append("instagramLink", data.instagramLink);
  if (data.facebookLink) formData.append("facebookLink", data.facebookLink);
  if (data.tiktokLink) formData.append("tiktokLink", data.tiktokLink);
  if (data.snapchatLink) formData.append("snapchatLink", data.snapchatLink);
  if (data.googleMapsLink) formData.append("googleMapsLink", data.googleMapsLink);

  if (data.phones && data.phones.length > 0) {
    data.phones.forEach((phone) => formData.append("phones", phone));
  }

  if (deleteLogo) {
    formData.append("deleteLogo", "true");
  } else if (logoFile) {
    formData.append("logo", logoFile);
  }

  if (deletePublicImage) {
    formData.append("deletePublicImage", "true");
  } else if (publicImageFile) {
    formData.append("publicImage", publicImageFile);
  }

  return apiRequest<RestaurantResponse>(`/api/restaurants/${restaurantId}`, {
    method: "PUT",
    body: formData,
  });
}
export async function getBanners(restaurantId: string): Promise<BannersResponse> {
  return apiRequest<BannersResponse>(`/api/restaurants/${restaurantId}/banners`);
}

export async function addBanner(
  restaurantId: string,
  image: File
): Promise<BannersResponse> {
  const formData = new FormData();
  formData.append("image", image);
  return apiRequest<BannersResponse>(
    `/api/restaurants/${restaurantId}/addBanner`,
    { method: "PATCH", body: formData }
  );
}

export async function deleteBanner(
  restaurantId: string,
  bannerId: string
): Promise<BannersResponse> {
  return apiRequest<BannersResponse>(
    `/api/restaurants/${restaurantId}/deleteBanner/${bannerId}`,
    { method: "PATCH" }
  );
}

export async function updateBannerVisibility(
  restaurantId: string,
  bannerId: string,
  visible: boolean
): Promise<BannersResponse> {
  return apiRequest<BannersResponse>(
    `/api/restaurants/${restaurantId}/updateBanner`,
    {
      method: "PATCH",
      body: { id: bannerId, visible },
    }
  );
}