import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { UniqueIdentifier } from "@dnd-kit/core";

import { getErrorMessage } from "../../api/errors";
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
import AddDishModal from "../../components/ui/dish/AddDishModa";
import { useAuth } from "../../context/AuthContext";
import useToast from "../../hooks/useToast";
import { dataUrlToFile, isDataUrl } from "../../lib/files";
import { categoryWithDishesToUI } from "../../lib/mappers";
import * as dishService from "../../services/dish.service";
import type { Dish } from "../../types/dish";
import type { LanguageConfig } from "../../components/ui/category/CategoryRow";
import type { Language } from "../../types/enums";
import type { AllDishesResponse } from "../../services/dish.service";

const ITEMS_PER_PAGE = 1000;

function buildDishPayload(data: Omit<Dish, "id" | "order" | "likes">) {
  const payload: dishService.DishFormPayload = {
    english: data.english,
    french: data.french,
    arabic: data.arabic,
    description: data.description,
    price: data.price,
    available: data.available,
    status: data.status,
  };
  if (data.image && isDataUrl(data.image)) {
    payload.imageFile = dataUrlToFile(data.image, "dish-image.png");
  }
  return payload;
}

function DishesPage() {
  const { menuId, restaurantId } = useAuth();
  const queryClient = useQueryClient();
  const { toasts, showToast, removeToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<
    UniqueIdentifier | "all"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Dish | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));
  const dishesKey = ["dishes", restaurantId];

  const {
    data: allDishesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: dishesKey,
    queryFn: () => dishService.getAllDishesByRestaurant(restaurantId!),
    enabled: !!restaurantId,
  });

  const { categoryOptions, dishes, supportedLanguages } = useMemo(() => {
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
          catUI.english || catUI.french || catUI.arabic || String(catUI.id);

        const mapped = catDishes.map(
          (dish) =>
            ({
              id: dish.id,
              order: dish.order,
              image: dish.image,
              english: dish.english,
              french: dish.french,
              arabic: dish.arabic,
              description: dish.description,
              price: dish.price,
              available: dish.available,
              status: dish.status,
              likes: dish.likes,
              categoryId: dish.categoryId,
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
    };
  }, [allDishesData, menuId]);

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

  const createMutation = useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: dishService.DishFormPayload;
    }) => dishService.createDish(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dishesKey });
      showToast(
        "success",
        "Dish Added",
        "New dish has been added successfully.",
      );
    },
    onError: (err) => showToast("error", "Save Failed", getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: dishService.DishFormPayload;
    }) => dishService.updateDish(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dishesKey });
      showToast(
        "success",
        "Dish Updated",
        "Dish has been updated successfully.",
      );
    },
    onError: (err) => showToast("error", "Save Failed", getErrorMessage(err)),
  });

const toggleVisibleMutation = useMutation({
  mutationFn: (id: string) => dishService.toggleDishVisible(id),

  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: dishesKey });
    const previous = queryClient.getQueryData<AllDishesResponse>(dishesKey);

    queryClient.setQueryData<AllDishesResponse>(dishesKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        menus: old.menus.map((menu) => ({
          ...menu,
          categories: menu.categories.map((cat) => ({
            ...cat,
            dishes: cat.dishes.map((dish) =>
              dish.id === id
                ? { ...dish, isVisible: !dish.isVisible }
                : dish
            ),
          })),
        })),
      };
    });

    return { previous };
  },

  onSuccess: () => {
    showToast("success", "Visibility Updated", "Dish visibility has been updated.");
  },
  onError: (err, _variables, context) => {
    queryClient.setQueryData<AllDishesResponse>(dishesKey, context?.previous);
    showToast("error", "Update Failed", getErrorMessage(err));
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: dishesKey });
  },
});

const toggleAvailableMutation = useMutation({
  mutationFn: (id: string) => dishService.toggleDishAvailable(id),

  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: dishesKey });
    const previous = queryClient.getQueryData<AllDishesResponse>(dishesKey);

    queryClient.setQueryData<AllDishesResponse>(dishesKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        menus: old.menus.map((menu) => ({
          ...menu,
          categories: menu.categories.map((cat) => ({
            ...cat,
            dishes: cat.dishes.map((dish) =>
              dish.id === id
                ? { ...dish, isAvailable: !dish.isAvailable }
                : dish
            ),
          })),
        })),
      };
    });

    return { previous };
  },

  onSuccess: () => {
    showToast("success", "Availability Updated", "Dish availability has been updated.");
  },
  onError: (err, _variables, context) => {
    queryClient.setQueryData<AllDishesResponse>(dishesKey, context?.previous);
    showToast("error", "Update Failed", getErrorMessage(err));
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: dishesKey });
  },
});

const deleteMutation = useMutation({
  mutationFn: (id: string) => dishService.deleteDish(id),

  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: dishesKey });
    const previous = queryClient.getQueryData<AllDishesResponse>(dishesKey);

    queryClient.setQueryData<AllDishesResponse>(dishesKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        menus: old.menus.map((menu) => ({
          ...menu,
          categories: menu.categories.map((cat) => ({
            ...cat,
            dishes: cat.dishes.filter((dish) => dish.id !== id),
          })),
        })),
      };
    });

    return { previous };
  },

  onSuccess: () => {
    showToast("success", "Dish Deleted", "Dish has been deleted successfully.");
  },
  onError: (err, _variables, context) => {
    queryClient.setQueryData<AllDishesResponse>(dishesKey, context?.previous);
    showToast("error", "Delete Failed", getErrorMessage(err));
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: dishesKey });
  },
});

const reorderMutation = useMutation({
  mutationFn: ({ categoryId, orderedIds }: { categoryId: string; orderedIds: string[] }) =>
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
              dishes: orderedIds.map((id) => map.get(id)).filter(Boolean) as typeof cat.dishes,
            };
          }),
        })),
      };
    });

    return { previous };
  },

  onSuccess: () => {
    showToast("success", "Dishes Reordered", "Dish order has been updated successfully.");
  },
  onError: (err, _variables, context) => {
    queryClient.setQueryData<AllDishesResponse>(dishesKey, context?.previous);
    showToast("error", "Reorder Failed", getErrorMessage(err));
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: dishesKey });
  },
});
  const handleConfirm = (data: Omit<Dish, "id" | "order" | "likes">) => {
    const payload = buildDishPayload(data);
    if (editTarget) {
      updateMutation.mutate({ id: String(editTarget.id), payload });
    } else {
      createMutation.mutate({ categoryId: String(data.categoryId), payload });
    }
    setEditTarget(null);
    setModalOpen(false);
  };

  const handleEdit = (dish: Dish) => {
    const previous = dishes.find((d) => d.id === dish.id);
    if (!previous) return;

    const onlyAvailabilityChanged =
      previous.status === dish.status &&
      previous.available !== dish.available &&
      previous.english === dish.english &&
      previous.french === dish.french &&
      previous.arabic === dish.arabic &&
      previous.description === dish.description &&
      previous.price === dish.price &&
      previous.image === dish.image;

    const onlyStatusChanged =
      previous.available === dish.available &&
      previous.status !== dish.status &&
      previous.english === dish.english &&
      previous.french === dish.french &&
      previous.arabic === dish.arabic &&
      previous.description === dish.description &&
      previous.price === dish.price &&
      previous.image === dish.image;

    if (onlyAvailabilityChanged) {
      toggleAvailableMutation.mutate(String(dish.id));
    } else if (onlyStatusChanged) {
      toggleVisibleMutation.mutate(String(dish.id));
    } else {
      updateMutation.mutate({
        id: String(dish.id),
        payload: buildDishPayload(dish),
      });
    }
  };

  const handleDelete = (id: UniqueIdentifier) => {
    deleteMutation.mutate(String(id));
  };

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

  const filteredDishes = useMemo(
    () =>
      selectedCategory === "all"
        ? dishes
        : dishes.filter(
            (d) => String(d.categoryId) === String(selectedCategory),
          ),
    [dishes, selectedCategory],
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
    { key: "order", label: "Order", center: true, width: "min-w-[80px]" },
    { key: "image", label: "Icon", center: true, width: "min-w-[80px]" },
    {
      key: "english",
      label: "English",
      center: true,
      width: "min-w-[140px]",
      hidden: !languages.showEnglish,
    },
    {
      key: "french",
      label: "Français",
      center: true,
      width: "min-w-[140px]",
      hidden: !languages.showFrench,
    },
    {
      key: "arabic",
      label: "Arabic",
      center: true,
      width: "min-w-[140px]",
      hidden: !languages.showArabic,
    },
    {
      key: "description",
      label: "Description",
      center: true,
      width: "min-w-[200px]",
    },
    { key: "price", label: "Price", center: true, width: "min-w-[100px]" },
    {
      key: "available",
      label: "Available",
      center: true,
      width: "min-w-[120px]",
    },
    { key: "status", label: "Status", center: true, width: "min-w-[120px]" },
    { key: "likes", label: "Likes", center: true, width: "min-w-[100px]" },
    { key: "actions", label: "Actions", center: true, width: "min-w-[140px]" },
  ];

  const noRestaurantError = !restaurantId
    ? "No restaurant found. Please log in again."
    : null;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col p-6 sm:p-8 lg:p-10 w-full">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <PageHeader
          title="Dish Manager"
          description="Organize and manage your menu dishes"
          showDescription
        />
        <Button
          label="Add Dish"
          icon={Plus}
          onClick={() => {
            setEditTarget(null);
            setModalOpen(true);
          }}
          disabled={isLoading || isError || categoryOptions.length === 0}
        />
      </div>

      {!isLoading &&
        !isError &&
        !noRestaurantError &&
        missingTranslationCount > 0 && (
          <Notification
            variant="warning"
            title="Missing Translations"
            message={`${missingTranslationCount} dish${
              missingTranslationCount > 1 ? "es have" : " has"
            } missing translations. Edit them to add all required languages.`}
            className="mb-6"
          />
        )}

      {noRestaurantError ? (
        <PageErrorState message={noRestaurantError} />
      ) : isLoading ? (
        <PageLoadingState message="Loading dishes..." />
      ) : isError ? (
        <PageErrorState
          message={getErrorMessage(error, "Could not load dishes.")}
          onRetry={refetch}
        />
      ) : (
        <>
          <div className="mb-4">
            <CategoryFilterBar
              categories={categoryOptions}
              selected={selectedCategory}
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
                      onSave={handleEdit}
                      onDelete={handleDelete}
                      isLast={index === paginatedDishes.length - 1}
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
        key={editTarget?.id ?? "new"}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onConfirm={handleConfirm}
        editData={editTarget}
        categories={categoryOptions}
        supportedLanguages={supportedLanguages}
      />
    </div>
  );
}

export default DishesPage;
