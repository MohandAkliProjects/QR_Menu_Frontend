/** Mirrors com.qrmenu.qrmenu.enums — JSON keys match backend serialization */

// enums.ts
export type Language = "en" | "fr" | "ar";
export type Devise =
  | "dzd"
  | "eur"
  | "usd"
  | "gbp"
  | "sar"
  | "aed"
  | "try"
  | "cad"
  | "chf"
  | "cny";

export type Role = "RESTAURANT_ADMIN" | "SUPER_ADMIN";

export type RestaurantState = "test" | "active" | "non_active";

export type TypeOfView = "DIRECT" | "QR_CODE" | "ADMIN";

export type SocialPlatform =
  | "FACEBOOK"
  | "INSTAGRAM"
  | "TIKTOK"
  | "EMAIL"
  | "WEBSITE"
  | "GOOGLE";
