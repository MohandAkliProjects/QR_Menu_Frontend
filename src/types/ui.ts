import type { UniqueIdentifier } from "@dnd-kit/core";

/**
 * Flattened shapes for your existing table/modal UI.
 * Map from API responses with helpers in src/lib/mappers.ts
 */

export type VisibilityStatus = "visible" | "hidden";
export type AvailabilityStatus = "available" | "unavailable";

export interface LanguageConfig {
  showEnglish: boolean;
  showFrench: boolean;
  showArabic: boolean;
}

/** Used by CategoriesPage / CategoryRow */
export interface CategoryUI {
  id: UniqueIdentifier;
  order: number;
  icon: string | null;
  english: string;
  french?: string;
  arabic?: string;
  status: VisibilityStatus;
}

/** Used by DishesPage / DishRow */
export interface DishUI {
  id: UniqueIdentifier;
  order: number;
  image: string | null;
  english: string;
  french?: string;
  arabic?: string;
  description?: string;
  price: number;
  available: AvailabilityStatus;
  status: VisibilityStatus;
  likes: number;
  categoryId: UniqueIdentifier;
}

/** Used by InformationPage form */
export interface RestaurantFormData {
  restaurantName: string;
  email: string;
  address: string;
  city: string;
  phones: { id: number; value: string }[];
  socials: { id: number; platform: string; url: string }[];
}

export interface RestaurantFormErrors {
  restaurantName?: string;
  email?: string;
  address?: string;
  city?: string;
  phones?: Record<number, string | undefined>;
  socials?: Record<number, string | undefined>;
}
