import type {
  Devise,
  Language,
  RestaurantState,
  Role,
  TypeOfView,
} from "./enums";


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


export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
  restaurantId: string;
}


export interface BannerResponse {
  id: string;
  imageUrl: string;
  visible: boolean;
}

export interface BannersResponse {
  id: string;
  banners: BannerResponse[];
}

export interface DishSize {
  name: string;
  price: number;
}


export interface DishResponse {
  id: string;
  categoryId: string;
  sizes: DishSize[];
  imageUrl?: string;
  imageUpdateDate?: Date | null;
  likesCount: number;
  isAvailable: boolean;
  /** @deprecated */
  available: boolean;
  isVisible: boolean;
  /** @deprecated */
  visible: boolean;
  order: number;
  translations: TranslationsMap<DishTranslation>;
  supplements: SupplementResponse[];
}

export interface CategoryResponse {
  id: string;
  menuId: string;
  iconUrl?: string;
  isVisible: boolean;
  /** @deprecated */
  visible: boolean;
  order: number;
  translations: TranslationsMap<CategoryTranslation>;
}

export interface CategoryWithDishesResponse {
  id: string;
  iconUrl?: string;
  order: number;
  isVisible: boolean;
  /** @deprecated */
  visible: boolean;
  translations: TranslationsMap<CategoryTranslation>;
  dishes: DishResponse[];
}


export interface MenuResponse {
  id: string;
  restaurantId: string;
  devise: Devise;
  translations: Record<string, { title: string }>;
  totalCategories: number;
  totalDishes: number;
  publicKey: string;
}

export interface RestaurantInfo {
  name: string;
  logoUrl?: string;
  ville: string;
  address?: string;
  instagramLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  snapchatLink?: string;
  googleMapsLink?: string;
  googleMapsReviewLink?: string;
  emailAddress?: string;
  phones?: string[];
  banners?: BannerResponse[];
}

export interface FullMenuResponse {
  id: string;
  restaurantId: string;
  translations: TranslationsMap<MenuTranslation>;
  devise: Devise;
  categories: CategoryWithDishesResponse[];
  restaurant: RestaurantInfo;
}

export interface MenuWithCategoriesResponse {
  id: string;
  translations: TranslationsMap<MenuTranslation>;
  devise: Devise;
  categories: CategoryResponse[];
}


export interface AllCategoriesResponse {
  menus: MenuWithCategoriesResponse[];
}


export interface RestaurantResponse {
  id: string;
  name: string;
  slug: string;
  emailAddress: string;
  phones: string[];
  subscriptionEndDate?: string;
  instagramLink?: string;
  snapchatLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  googleMapsLink?: string;
  googleMapsReviewLink?: string;
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
  totalLikes: number;
  subscriptionEndDate?: string;
  likes: { likedAt: string }[];
}


export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}

export interface ReorderCategoriesRequest {
  orderedCategoriesIds: string[];
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
  snapchatLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  emailAddress?: string;
  googleMapsLink?: string;
  googleMapsReviewLink?: string;
  deleteLogo?: boolean;
  deletePublicImage?: boolean;
}

export interface BaseCategoryRequest {
  englishName?: string,
  frenchName?: string,
  arabicName?: string,
  visible: boolean,
  image?: string
}

export interface CreateCategoryRequest extends BaseCategoryRequest {
  menuId: string,
}

export interface UpdateCategoryRequest extends BaseCategoryRequest {
  categoryId: string,
  wantToDeleteImage?: boolean;
}

export interface BaseDishRequest {
  englishName?: string,
  frenchName?: string,
  arabicName?: string,
  englishDescription?: string,
  frenchDescription?: string,
  arabicDescription?: string,
  available: boolean,
  visible: boolean
  image?: string,
  sizes: DishSize[],
}

export interface CreateDishRequest extends BaseDishRequest {
  categoryId: string,
}

export interface UpdateDishRequest extends BaseDishRequest {
  dishId: string,
  wantToDeleteImage?: boolean;
}


export interface SupplementTranslation {
  name: string;
}

export interface SupplementResponse {
  id: string;
  price: number;
  isAvailable: boolean;
  /** @deprecated */
  available: boolean;
  isVisible: boolean;
  /** @deprecated */
  visible: boolean;
  translations: TranslationsMap<SupplementTranslation>;
}
export interface MenuWithSupplementsResponse {
  id: string;
  translations: TranslationsMap<MenuTranslation>;
  devise: Devise;
  supplements: SupplementResponse[];
}

export interface AllSupplementsResponse {
  menus: MenuWithSupplementsResponse[];
}

export interface BaseSupplementRequest {
  englishName?: string;
  frenchName?: string;
  arabicName?: string;
  price: number;
  available: boolean;
  visible: boolean;
}

export interface CreateSupplementRequest extends BaseSupplementRequest {
  menuId: string;
}

export interface UpdateSupplementRequest extends BaseSupplementRequest {
  supplementId: string;
}