import type {
  FullMenuResponse,
  DishResponse,
  CategoryWithDishesResponse,
  BannerResponse,
} from "../../../types/api";
import type { Language } from "../../../types/enums";
import type { MenuStrings } from "../../../lib/constants/menu-strings";

export interface MenuThemeProps {
  menu: FullMenuResponse;
  menuTitle: string;
  banners: BannerResponse[];
  categoriesWithDishes: CategoryWithDishesResponse[];
  language: Language;
  availableLanguages: Language[];
  onLanguageChange: (language: Language) => void;
  liked: Set<string>;
  onLike: (dishId: string) => void;
  selectedDish: DishResponse | null;
  onSelectDish: (dish: DishResponse | null) => void;
  search: string;
  onSearchChange: (value: string) => void;
  searchResults: DishResponse[] | null;
  activeCategoryId: string;
  onCategorySelect: (id: string) => void;
  allId: string;
  stickyRef: React.RefObject<HTMLDivElement | null>;
  sectionRefs: React.RefObject<Record<string, HTMLElement | null>>;
  t: MenuStrings;
}