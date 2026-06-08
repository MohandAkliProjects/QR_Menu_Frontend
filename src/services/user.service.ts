import { apiRequest } from "../api/client";

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/users/me/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  });
}