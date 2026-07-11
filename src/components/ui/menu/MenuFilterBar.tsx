import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../i18n/useLanguage";
import * as menuService from "../../../services/menu.service";

function MenuFilterBar() {
  const { restaurantId, menuId, setMenuId } = useAuth();
  const { language } = useLanguage();

  const { data: menus = [] } = useQuery({
    queryKey: ["menus", restaurantId],
    queryFn: () => menuService.getMenusByRestaurant(restaurantId!),
    enabled: !!restaurantId,
  });

  // Only worth showing a filter when there's actually a choice to make
  if (menus.length <= 1) return null;

  const labelFor = (menu: (typeof menus)[number]) => {
    const translations = menu.translations ?? {};
    return (
      translations[language]?.title ??
      translations["fr"]?.title ??
      translations["en"]?.title ??
      Object.values(translations)[0]?.title ??
      menu.id
    );
  };

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-2 min-w-max">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setMenuId(menu.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap hover:cursor-pointer
              ${
                menuId === menu.id
                  ? "bg-primary-700 text-cream-500 border-primary-700"
                  : "bg-transparent border-beige-400 text-text-500 hover:bg-beige-200"
              }
            `}
          >
            {labelFor(menu)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MenuFilterBar;