import type { UniqueIdentifier } from "@dnd-kit/core";
import type { CategoryResponse, DishSize } from "../types/api";
import type { Language } from "../types/enums";

export type VisibilityStatus = "visible" | "hidden";
export type AvailabilityStatus = "available" | "unavailable";

export interface LanguageConfig {
  showEnglish: boolean;
  showFrench: boolean;
  showArabic: boolean;
}

export interface CategoryUI {
  id: UniqueIdentifier;
  order: number;
  icon: string | null;
  english?: string;
  french?: string;
  arabic?: string;
  status: VisibilityStatus;
}

export type CategoriesPageData = {
  categories: CategoryResponse[];
  supportedLanguages: Language[];
};

export interface DishUI {
  id: UniqueIdentifier;
  order: number;
  image: string | null;
  english: string;
  french?: string;
  arabic?: string;
  englishDescription?: string;
  frenchDescription?: string;
  arabicDescription?: string;
  sizes: DishSize[];
  available: AvailabilityStatus;
  status: VisibilityStatus;
  likes: number;
  categoryId: UniqueIdentifier;
}


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


