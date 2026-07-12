
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
  |"Snapchat"
  |"Google Maps";

export const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatus = typeof HttpStatus[keyof typeof HttpStatus];
