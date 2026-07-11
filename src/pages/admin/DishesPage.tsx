import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { UniqueIdentifier } from "@dnd-kit/core";
import PageHeader from "../../components/shared/PageHeader";
import PageErrorState from "../../components/shared/PageErrorState";
import PageLoadingState from "../../components/shared/PageLoadingState";
import Notification from "../../components/shared/Notification";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import Table from "../../components/ui/table/Table";
import type { Column } from "../../components/ui/table/Table";
import DishRow from "../../components/ui/dish/DishRow";
import CategoryFilterBar from "../../components/ui/dish/CategoryFilterBar";
import ToastContainer from "../../components/ui/ToastContainer";
import AddDishModal from "../../components/ui/dish/AddDishModal";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/useLanguage";
import useToast from "../../hooks/useToast";
import { categoryWithDishesToUI } from "../../lib/mappers";
import * as dishService from "../../services/dish.service";
import type { Dish } from "../../types/dish";
import type { LanguageConfig } from "../../components/ui/category/CategoryRow";
import type { Devise, Language } from "../../types/enums";
import type { AllDishesResponse } from "../../services/dish.service";
import { dishesText } from "./text/DishesPage.text";
import { generalText } from "./text/General.text.ts";

const ITEMS_PER_PAGE = 1000;

function DishesPage() {
  const { menuId, restaurantId } = useAuth();
  const queryClient = useQueryClient();
  const { toasts, showToast, removeToast } = useToast();
  const { language } = useLanguage();
  const t = dishesText[language];
  const gt = generalText[language]

  const [selectedCategory, setSelectedCategory] =
    useState<UniqueIdentifier | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const dishesKey = ["dishes", restaurantId];

  const {
    data: allDishesData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: dishesKey,
    queryFn: () => dishService.getAllDishesByRestaurant(restaurantId!),
    enabled: !!restaurantId,
  });

  const { categoryOptions, dishes, supportedLanguages, devise } =
    useMemo(() => {
      const menus = allDishesData?.menus ?? [];
      const activeMenu =
        (menuId ? menus.find((m) => m.id === menuId) : null) ?? menus[0];

      const langs = activeMenu
        ? (Object.keys(activeMenu.translations).map((k) =>
            k.toUpperCase(),
          ) as Language[])
        : [];

      const categoryOpts: {
        id: UniqueIdentifier;
        label: string;
        count: number;
      }[] = [];
      const allDishes: Dish[] = [];

      for (const menu of menus) {
        for (const category of menu.categories ?? []) {
          const { category: catUI, dishes: catDishes } =
            categoryWithDishesToUI(category);

          const label =
            language === "fr"
              ? catUI.french || catUI.english || catUI.arabic || String(catUI.id)
              : catUI.english || catUI.french || catUI.arabic || String(catUI.id);

          const mapped = catDishes.map(
            (dish) =>
              ({
                id: dish.id,
                order: dish.order,
                image: dish.image,
                english: dish.english,
                french: dish.french,
                arabic: dish.arabic,
                englishDescription: dish.englishDescription,
                frenchDescription: dish.frenchDescription,
                arabDescription: dish.arabicDescription,
                sizes: dish.sizes,
                available: dish.available,
                status: dish.status,
                likes: dish.likes,
                categoryId: dish.categoryId,
                supplements: dish.supplements,
              }) as Dish,
          );

          categoryOpts.push({ id: catUI.id, label, count: mapped.length });
          allDishes.push(...mapped);
        }
      }

      return {
        categoryOptions: categoryOpts,
        dishes: allDishes,
        supportedLanguages: langs,
        devise: (activeMenu?.devise ?? "usd") as Devise,
      };
    }, [allDishesData, menuId, language]);

  const languages: LanguageConfig = useMemo(
    () => ({
      showEnglish:
        supportedLanguages.length === 0 ||
        supportedLanguages.includes("EN" as Language),
      showFrench: supportedLanguages.includes("FR" as Language),
      showArabic: supportedLanguages.includes("AR" as Language),
    }),
    [supportedLanguages],
  );

  const missingTranslationCount = useMemo(
    () =>
      dishes.filter((d) => {
        if (languages.showEnglish && !d.english) return true;
        if (languages.showFrench && !d.french) return true;
        if (languages.showArabic && !d.arabic) return true;
        return false;
      }).length,
    [dishes, languages],
  );

  const reorderMutation = useMutation({
    mutationFn: ({
      categoryId,
      orderedIds,
    }: {
      categoryId: string;
      orderedIds: string[];
    }) =>
      dishService.reorderDishes(categoryId, { orderedDishesIds: orderedIds }),

    onMutate: async ({ categoryId, orderedIds }) => {
      await queryClient.cancelQueries({ queryKey: dishesKey });
      const previous = queryClient.getQueryData<AllDishesResponse>(dishesKey);

      queryClient.setQueryData<AllDishesResponse>(dishesKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          menus: old.menus.map((menu) => ({
            ...menu,
            categories: menu.categories.map((cat) => {
              if (String(cat.id) !== categoryId) return cat;
              const map = new Map(cat.dishes.map((d) => [String(d.id), d]));
              return {
                ...cat,
                dishes: orderedIds
                  .map((id) => map.get(id))
                  .filter(Boolean) as typeof cat.dishes,
              };
            }),
          })),
        };
      });

      return { previous };
    },

    onError: (_err, _variables, context) => {
      queryClient.setQueryData<AllDishesResponse>(dishesKey, context?.previous);
      showToast("error", gt.reorderFailedTitle, gt.reorderFailed);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dishesKey });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeDish = dishes.find((d) => d.id === active.id);
    if (!activeDish) return;

    const categoryId = String(activeDish.categoryId);
    const categoryDishes = dishes
      .filter((d) => String(d.categoryId) === categoryId)
      .sort((a, b) => a.order - b.order);

    const oldIndex = categoryDishes.findIndex((d) => d.id === active.id);
    const newIndex = categoryDishes.findIndex((d) => d.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...categoryDishes];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    reorderMutation.mutate({
      categoryId,
      orderedIds: reordered.map((d) => String(d.id)),
    });
  };

  const activeCategory: UniqueIdentifier | null = useMemo(() => {
    if (
      selectedCategory != null &&
      categoryOptions.some((c) => c.id === selectedCategory)
    ) {
      return selectedCategory;
    }
    return categoryOptions[0]?.id ?? null;
  }, [selectedCategory, categoryOptions]);

  const filteredDishes = useMemo(
    () =>
      activeCategory == null
        ? []
        : dishes.filter(
            (d) => String(d.categoryId) === String(activeCategory),
          ),
    [dishes, activeCategory],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDishes.length / ITEMS_PER_PAGE),
  );
  const paginatedDishes = filteredDishes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const columns: Column[] = [
  { key: "order", label: t.colOrder, center: true, width: "min-w-[80px]" },
  { key: "image", label: t.colIcon, center: true, width: "min-w-[80px]" },
  {
    key: "english",
    label: t.colEnglish,
    center: true,
    width: "min-w-[140px]",
    hidden: !languages.showEnglish,
  },
  {
    key: "french",
    label: t.colFrench,
    center: true,
    width: "min-w-[140px]",
    hidden: !languages.showFrench,
  },
  {
    key: "arabic",
    label: t.colArabic,
    center: true,
    width: "min-w-[140px]",
    hidden: !languages.showArabic,
  },
  {
    key: "description",
    label: t.colDescription,
    center: true,
    width: "min-w-[200px]",
  },
  { key: "sizes", label: t.colSizes, center: true, width: "min-w-[200px]" },
 { key: "supplements", label: t.colSupplements, center: true, width: "min-w-[160px]" },
  {
    key: "available",
    label: t.colAvailable,
    center: true,
    width: "min-w-[120px]",
  },
  { key: "status", label: t.colStatus, center: true, width: "min-w-[120px]" },
  { key: "likes", label: t.colLikes, center: true, width: "min-w-[100px]" },
  { key: "actions", label: t.colActions, center: true, width: "min-w-[140px]" },
];

  const noRestaurantError = !restaurantId ? t.noRestaurantError : null;

  return (
    <div className="flex flex-col p-6 sm:p-8 lg:p-10 w-full">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <PageHeader
          title={t.pageTitle}
          description={t.pageDescription}
          showDescription
        />
        <Button
          label={t.addDish}
          icon={Plus}
          onClick={() => setModalOpen(true)}
          disabled={isLoading || isError || categoryOptions.length === 0}
        />
      </div>

      {!isLoading &&
        !isError &&
        !noRestaurantError &&
        missingTranslationCount > 0 && (
          <Notification
            variant="warning"
            title={t.missingTranslationsTitle}
            message={`${missingTranslationCount} ${
              missingTranslationCount > 1
                ? t.missingTranslationsPlural
                : t.missingTranslationsSingle
            }`}
            className="mb-6"
          />
        )}

      {noRestaurantError ? (
        <PageErrorState message={noRestaurantError} />
      ) : isLoading ? (
        <PageLoadingState message={t.loading} />
      ) : isError ? (
        <PageErrorState
          onRetry={refetch}
        />
      ) : (
        <>
          <div className="mb-4">
            <CategoryFilterBar
              categories={categoryOptions}
              selected={activeCategory}
              onSelect={(id) => {
                setSelectedCategory(id);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={paginatedDishes.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table columns={columns}>
                  {paginatedDishes.map((dish, index) => (
                    <DishRow
                      key={dish.id}
                      dish={dish}
                      devise={devise}
                      isLast={index === paginatedDishes.length - 1}
                      isFirst={index === 0}
                      languages={languages}
                    />
                  ))}
                </Table>
              </SortableContext>
            </DndContext>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <AddDishModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categoryOptions}
        supportedLanguages={supportedLanguages}
        devise={devise}
      />
    </div>
  );
}

export default DishesPage;