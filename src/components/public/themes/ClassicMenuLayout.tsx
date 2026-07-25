import type { MenuThemeProps } from "./types";
import HeroCarousel from "../HeroCarousel";
import RestaurantHeader from "../RestaurantHeader";
import SearchBar from "../SearchBar";
import CategoryFilter from "../CategoryFilter";
import DishCard from "../DishCard";
import DishModal from "../DishModal";
import EmptyCategory from "../EmptyCategory";
import RestaurantInfoCard from "../RestaurantInfoCard";
import Footer from "../Footer";
import { getCategoryName, isRTL } from "../../../utils/menu-display";
import "../../../styles/public-menu.css";

const STICKY_OFFSET_FALLBACK = 132;

export default function ClassicMenuLayout({
  menu,
  menuTitle,
  banners,
  categoriesWithDishes,
  language,
  availableLanguages,
  onLanguageChange,
  liked,
  onLike,
  selectedDish,
  onSelectDish,
  search,
  onSearchChange,
  searchResults,
  activeCategoryId,
  onCategorySelect,
  allId,
  sectionRefs,
  stickyRef,
  t,
}: MenuThemeProps) {
  return (
    <div
      dir={isRTL(language) ? "rtl" : "ltr"}
      className="min-h-screen"
      style={{
        background: "var(--menu-bg)",
        fontFamily: '"Nunito", system-ui, sans-serif',
      }}
    >
      {selectedDish && (
        <DishModal
          dish={selectedDish}
          devise={menu.devise}
          language={language}
          liked={liked.has(selectedDish.id)}
          onLike={() => onLike(selectedDish.id)}
          onClose={() => onSelectDish(null)}
          t={t}
        />
      )}

      <div className="w-full sm:max-w-2xl lg:max-w-5xl mx-auto px-4 pb-24">
        {banners.length > 0 && (
          <div className="pt-4">
            <HeroCarousel banners={banners} />
          </div>
        )}

        <div className="pt-5 pb-4">
          <RestaurantHeader
            restaurant={menu.restaurant}
            menuTitle={menuTitle}
            availableLanguages={availableLanguages}
            selectedLanguage={language}
            onLanguageChange={onLanguageChange}
          />
        </div>

        <div
          ref={stickyRef}
          className="sticky top-0 z-20 -mx-4 px-4 py-3 border-b border-(--menu-border)"
          style={{ background: "var(--menu-bg)" }}
        >
          <div className="mb-3">
            <SearchBar
              value={search}
              onChange={onSearchChange}
              placeholder={t.searchPlaceholder}
            />
          </div>
          {!search && (
            <CategoryFilter
              categories={categoriesWithDishes}
              activeCategoryId={activeCategoryId}
              language={language}
              onSelect={onCategorySelect}
              allId={allId}
              t={t}
            />
          )}
        </div>

        {searchResults !== null ? (
          <div className="pt-4">
            <p className="text-xs text-(--menu-muted) mb-3">
              {t.searchResults(searchResults.length, search)}
            </p>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {searchResults.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    devise={menu.devise}
                    language={language}
                    liked={liked.has(dish.id)}
                    onLike={() => onLike(dish.id)}
                    onClick={() => onSelectDish(dish)}
                    t={t}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-base font-semibold text-(--menu-primary) menu-font-display">
                  {t.noResults}
                </p>
                <p className="text-xs text-(--menu-muted) mt-1">
                  {t.noResultsHint}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 pt-6">
              {categoriesWithDishes.map((category) => {
                const catLabel = getCategoryName(category, language);

                return (
                  <section
                    key={category.id}
                    ref={(el) => {
                      sectionRefs.current[category.id] = el;
                    }}
                    style={{ scrollMarginTop: STICKY_OFFSET_FALLBACK + 8 }}
                    className="pb-4"
                  >
                    <h2 className="text-lg font-bold text-(--menu-primary) mb-3 menu-font-display">
                      {catLabel}
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {category.dishes.map((dish) => (
                        <DishCard
                          key={dish.id}
                          dish={dish}
                          devise={menu.devise}
                          language={language}
                          liked={liked.has(dish.id)}
                          onLike={() => onLike(dish.id)}
                          onClick={() => onSelectDish(dish)}
                          t={t}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

              {categoriesWithDishes.length === 0 && (
                <EmptyCategory
                  title={t.noItemsTitle}
                  message={t.noDishes}
                  hint={t.noItemsHint}
                />
              )}
            </div>

            <div className="my-6 border-t border-(--menu-border)" />

            <RestaurantInfoCard restaurant={menu.restaurant} showMap={true} />

            <Footer restaurant={menu.restaurant} language={language} />
          </>
        )}
      </div>
    </div>
  );
}