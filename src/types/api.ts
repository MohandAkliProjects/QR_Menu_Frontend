import type {
  Devise,
  Language,
  RestaurantState,
  Role,
  TypeOfView,
} from "./enums";

// ─── Shared translation shapes (backend models) ─────────────────────────────

export interface DishTranslation {
  name: string;
  description?: string;
}

export interface CategoryTranslation {
  name: string;
}

export interface MenuTranslation {
  title: string;
}

export type TranslationsMap<T> = Partial<Record<Language, T>>;

// ─── API responses (what your backend returns) ──────────────────────────────

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
  restaurantId: string;
}

export interface BannerResponse {
  id: string;
  imageUrl: string;
}

export interface DishResponse {
  id: string;
  categoryId: string;
  price: number;
  imageUrl?: string;
  likes: number;
  isAvailable: boolean;
  isVisible: boolean;
  order: number;
  translations: TranslationsMap<DishTranslation>;
}

export interface CategoryResponse {
  id: string;
  menuId: string;
  iconUrl?: string;
  isVisible: boolean;
  order: number;
  translations: TranslationsMap<CategoryTranslation>;
}

export interface CategoryWithDishesResponse {
  id: string;
  iconUrl?: string;
  order: number;
  isVisible: boolean;
  translations: TranslationsMap<CategoryTranslation>;
  dishes: DishResponse[];
}

export interface MenuResponse {
  id: string;
  restaurantId: string;
  devise: Devise;
  translations: TranslationsMap<MenuTranslation>;
}

export interface FullMenuResponse {
  id: string;
  translations: TranslationsMap<MenuTranslation>;
  devise: Devise;
  categories: CategoryWithDishesResponse[];
}

export interface RestaurantResponse {
  id: string;
  name: string;
  emailAddress: string;
  phones: string[];
  subscriptionEndDate?: string;
  instagramLink?: string;
  snapshatLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  googleMapsLink?: string;
  qrCode?: string;
  defaultMenuId?: string;
  ville: string;
  address?: string;
  logoUrl?: string;
  publicImageUrl?: string;
  banners: string[];
  state: RestaurantState;
}

export interface MenuView {
  typeOfView: TypeOfView;
  viewedAt: string;
}

export interface RestaurantDashboardStatsResponse {
  id: string;
  name: string;
  totalMenus: number;
  totalCategories: number;
  totalDishes: number;
  views: MenuView[];
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface LogoutResponse {
  message: string;
}

// ─── API requests (JSON body — not multipart) ───────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateCategoryRequest {
  translations: TranslationsMap<string>;
  isVisible?: boolean;
}

export interface UpdateCategoryRequest {
  translations?: TranslationsMap<string>;
  isVisible: boolean;
  wantToDeleteIcon?: boolean;
}

export interface ReorderCategoriesRequest {
  orderedCategoriesIds: string[];
}

export interface CreateDishRequest {
  translations: TranslationsMap<DishTranslation>;
  price: number;
  isAvailable?: boolean;
  isVisible?: boolean;
}

export interface UpdateDishRequest {
  translations?: TranslationsMap<DishTranslation>;
  price: number;
  isAvailable: boolean;
  isVisible: boolean;
  wantToDeleteImage?: boolean;
}

export interface ReorderDishesRequest {
  orderedDishesIds: string[];
}

export interface CreateMenuRequest {
  translations: TranslationsMap<string>;
  devise: Devise;
}

export interface UpdateMenuRequest {
  translations?: TranslationsMap<string>;
  devise: Devise;
}

export interface RestaurantUpdateRequest {
  restaurantName?: string;
  ville?: string;
  address?: string;
  phones?: string[];
  instagramLink?: string;
  snapshatLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  emailAddress?: string;
  googleMapsLink?: string;
  deleteLogo?: boolean;
  deletePublicImage?: boolean;
}