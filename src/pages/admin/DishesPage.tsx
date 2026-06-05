import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
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
  arrayMove,
} from "@dnd-kit/sortable";
import type { UniqueIdentifier } from "@dnd-kit/core";

import { getErrorMessage } from "../../api/errors";
import PageHeader from "../../components/shared/PageHeader";
import PageErrorState from "../../components/shared/PageErrorState";
import PageLoadingState from "../../components/shared/PageLoadingState";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import Table from "../../components/ui/table/Table";
import type { Column } from "../../components/ui/table/Table";
import DishRow from "../../components/ui/dish/DishRow";
import CategoryFilterBar from "../../components/ui/dish/CategoryFilterBar";
import ToastContainer from "../../components/ui/ToastContainer";
import { useAuth } from "../../context/AuthContext";
import useToast from "../../hooks/useToast";
import { dataUrlToFile, isDataUrl } from "../../lib/files";
import {
  categoryResponseToUI,
  dishResponseToUI,
} from "../../lib/mappers";
import * as categoryService from "../../services/category.service";
import * as dishService from "../../services/dish.service";
import type { Dish } from "../../types/dish";
import AddDishModal from "../../components/ui/dish/AddDishModa";
import type { LanguageConfig } from "../../components/ui/category/CategoryRow";

const ITEMS_PER_PAGE = 10;

const languages: LanguageConfig = {
  showEnglish: true,
  showFrench: true,
  showArabic: true,
};

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
  const { menuId } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<
    { id: UniqueIdentifier; label: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<UniqueIdentifier | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Dish | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor));

  const loadDishes = useCallback(async () => {
    if (!menuId) {
      setError("No menu found for this restaurant. Please create a menu first.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const categories = await categoryService.getCategoriesByMenu(menuId);
      const categoryUi = categories.map(categoryResponseToUI);
      setCategoryOptions(
        categoryUi.map((c) => ({ id: c.id, label: c.english || String(c.id) }))
      );

      const dishResponses = await dishService.getAllDishesForCategories(
        categories.map((c) => c.id)
      );
      setDishes(dishResponses.map(dishResponseToUI));
    } catch (err) {
      const message = getErrorMessage(err, "Could not load dishes.");
      setError(message);
      showToast("error", "Load Failed", message);
    } finally {
      setLoading(false);
    }
  }, [menuId, showToast]);

  useEffect(() => {
    loadDishes();
  }, [loadDishes]);

  const columns: Column[] = [
    { key: "order", label: "Order", center: true, width: "min-w-[80px]" },
    { key: "image", label: "Icon", center: true, width: "min-w-[80px]" },
    { key: "english", label: "English", center: true, width: "min-w-[140px]", hidden: !languages.showEnglish },
    { key: "french", label: "Français", center: true, width: "min-w-[140px]", hidden: !languages.showFrench },
    { key: "arabic", label: "Arabic", center: true, width: "min-w-[140px]", hidden: !languages.showArabic },
    { key: "description", label: "Description", center: true, width: "min-w-[200px]" },
    { key: "price", label: "Price", center: true, width: "min-w-[100px]" },
    { key: "available", label: "Available", center: true, width: "min-w-[120px]" },
    { key: "status", label: "Status", center: true, width: "min-w-[120px]" },
    { key: "likes", label: "Likes", center: true, width: "min-w-[100px]" },
    { key: "actions", label: "Actions", center: true, width: "min-w-[140px]" },
  ];

  const filteredDishes = useMemo(
    () =>
      selectedCategory === "all"
        ? dishes
        : dishes.filter((d) => d.categoryId === selectedCategory),
    [dishes, selectedCategory]
  );

  const totalPages = Math.max(1, Math.ceil(filteredDishes.length / ITEMS_PER_PAGE));
  const paginatedDishes = filteredDishes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleConfirm = async (data: Omit<Dish, "id" | "order" | "likes">) => {
    try {
      const payload = buildDishPayload(data);

      if (editTarget) {
        const updated = await dishService.updateDish(String(editTarget.id), payload);
        setDishes((prev) =>
          prev.map((d) =>
            d.id === editTarget.id ? dishResponseToUI(updated) : d
          )
        );
        showToast("success", "Dish Updated", "Dish has been updated successfully.");
      } else {
        const created = await dishService.createDish(String(data.categoryId), payload);
        setDishes((prev) => [...prev, dishResponseToUI(created)]);
        showToast("success", "Dish Added", "New dish has been added successfully.");
      }
      setEditTarget(null);
    } catch (err) {
      showToast("error", "Save Failed", getErrorMessage(err));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const scope =
      selectedCategory === "all"
        ? dishes
        : dishes.filter((d) => d.categoryId === selectedCategory);

    const oldIndex = scope.findIndex((d) => d.id === active.id);
    const newIndex = scope.findIndex((d) => d.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reorderedScope = arrayMove(scope, oldIndex, newIndex).map((d, i) => ({
      ...d,
      order: i + 1,
    }));

    const reorderedIds = new Set(reorderedScope.map((d) => d.id));
    const merged = [
      ...dishes.filter((d) => !reorderedIds.has(d.id)),
      ...reorderedScope,
    ].sort((a, b) => a.order - b.order);

    setDishes(merged);

    const categoryId = String(reorderedScope[0]?.categoryId);
    try {
      await dishService.reorderDishes(
        categoryId,
        reorderedScope.map((d) => String(d.id))
      );
      showToast("success", "Order Updated", "Dish order has been saved.");
    } catch (err) {
      await loadDishes();
      showToast("error", "Reorder Failed", getErrorMessage(err));
    }
  };

  const handleEdit = async (dish: Dish) => {
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

    setDishes((prev) => prev.map((d) => (d.id === dish.id ? dish : d)));

    try {
      let response;
      if (onlyAvailabilityChanged) {
        response = await dishService.toggleDishAvailable(String(dish.id));
      } else if (onlyStatusChanged) {
        response = await dishService.toggleDishVisible(String(dish.id));
      } else {
        response = await dishService.updateDish(
          String(dish.id),
          buildDishPayload(dish)
        );
      }

      setDishes((prev) =>
        prev.map((d) => (d.id === dish.id ? dishResponseToUI(response) : d))
      );
      showToast("success", "Dish Saved", "Your changes have been saved.");
    } catch (err) {
      setDishes((prev) => prev.map((d) => (d.id === dish.id ? previous : d)));
      showToast("error", "Save Failed", getErrorMessage(err));
    }
  };

  const handleDelete = async (id: UniqueIdentifier) => {
    try {
      await dishService.deleteDish(String(id));
      setDishes((prev) => {
        const filtered = prev.filter((d) => d.id !== id);
        return filtered.map((d, i) => ({ ...d, order: i + 1 }));
      });
      showToast("success", "Dish Deleted", "Dish has been removed.");
    } catch (err) {
      showToast("error", "Delete Failed", getErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col min-h-full p-6 sm:p-8 lg:p-10 w-full">
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
          disabled={loading || Boolean(error) || categoryOptions.length === 0}
        />
      </div>

      {loading ? (
        <PageLoadingState message="Loading dishes..." />
      ) : error ? (
        <PageErrorState message={error} onRetry={loadDishes} />
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
      />
    </div>
  );
}

export default DishesPage;
