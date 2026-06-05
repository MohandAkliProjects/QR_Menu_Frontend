import { useCallback, useEffect, useState } from "react";
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
import CategoryRow, {
  type Category,
  type LanguageConfig,
} from "../../components/ui/category/CategoryRow";
import AddCategoryModal from "../../components/ui/category/AddCategoryModal";
import ToastContainer from "../../components/ui/ToastContainer";
import { useAuth } from "../../context/AuthContext";
import useToast from "../../hooks/useToast";
import { categoryResponseToUI, categoryUIToTranslations } from "../../lib/mappers";
import * as categoryService from "../../services/category.service";

const ITEMS_PER_PAGE = 10;

const languages: LanguageConfig = {
  showEnglish: true,
  showFrench: true,
  showArabic: true,
};

function CategoriesPage() {
  const { menuId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor));

  const loadCategories = useCallback(async () => {
    if (!menuId) {
      setError("No menu found for this restaurant. Please create a menu first.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategoriesByMenu(menuId);
      setCategories(data.map(categoryResponseToUI));
    } catch (err) {
      const message = getErrorMessage(err, "Could not load categories.");
      setError(message);
      showToast("error", "Load Failed", message);
    } finally {
      setLoading(false);
    }
  }, [menuId, showToast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const totalPages = Math.max(1, Math.ceil(categories.length / ITEMS_PER_PAGE));
  const paginatedCategories = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns: Column[] = [
    { key: "order", label: "Order", center: true, width: "min-w-[80px]" },
    { key: "icon", label: "Icon", center: true, width: "min-w-[80px]" },
    { key: "english", label: "English", center: true, width: "min-w-[140px]", hidden: !languages.showEnglish },
    { key: "french", label: "Français", center: true, width: "min-w-[140px]", hidden: !languages.showFrench },
    { key: "arabic", label: "Arabic", center: true, width: "min-w-[140px]", hidden: !languages.showArabic },
    { key: "status", label: "Status", center: true, width: "min-w-[120px]" },
    { key: "actions", label: "Actions", center: true, width: "min-w-[140px]" },
  ];

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !menuId) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex).map((c, i) => ({
      ...c,
      order: i + 1,
    }));

    setCategories(reordered);

    try {
      await categoryService.reorderCategories(menuId, {
        orderedCategoriesIds: reordered.map((c) => String(c.id)),
      });
      showToast("success", "Order Updated", "Category order has been saved.");
    } catch (err) {
      await loadCategories();
      showToast("error", "Reorder Failed", getErrorMessage(err));
    }
  };

  const handleConfirm = async (data: Omit<Category, "id" | "order">) => {
    if (!menuId) return;

    try {
      if (editTarget) {
        const updated = await categoryService.updateCategory(String(editTarget.id), {
          translations: categoryUIToTranslations(data),
          isVisible: data.status === "visible",
        });
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editTarget.id ? categoryResponseToUI(updated) : c
          )
        );
        showToast("success", "Category Updated", "Category has been updated successfully.");
      } else {
        const created = await categoryService.createCategory(menuId, {
          translations: categoryUIToTranslations(data),
          isVisible: data.status === "visible",
        });
        setCategories((prev) => [...prev, categoryResponseToUI(created)]);
        setCurrentPage(1);
        showToast("success", "Category Added", "New category has been added successfully.");
      }
      setEditTarget(null);
    } catch (err) {
      showToast("error", "Save Failed", getErrorMessage(err));
    }
  };

  const handleDelete = (_id: UniqueIdentifier) => {
    showToast(
      "error",
      "Not Available",
      "Category deletion is not enabled on the server yet."
    );
  };

  const handleEdit = async (category: Category) => {
    const previous = categories.find((c) => c.id === category.id);
    if (!previous) return;

    const onlyStatusChanged =
      previous.english === category.english &&
      previous.french === category.french &&
      previous.arabic === category.arabic &&
      previous.icon === category.icon &&
      previous.status !== category.status;

    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? category : c))
    );

    try {
      const response = onlyStatusChanged
        ? await categoryService.toggleCategoryVisible(String(category.id))
        : await categoryService.updateCategory(String(category.id), {
            translations: categoryUIToTranslations(category),
            isVisible: category.status === "visible",
          });

      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id ? categoryResponseToUI(response) : c
        )
      );
      showToast("success", "Category Saved", "Your changes have been saved.");
    } catch (err) {
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? previous : c))
      );
      showToast("error", "Save Failed", getErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col min-h-full p-6 sm:p-8 lg:p-10 w-full">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <PageHeader
          title="Category Manager"
          description="Organize and manage your menu categories"
          showDescription
        />
        <Button
          label="Add Category"
          icon={Plus}
          onClick={() => {
            setEditTarget(null);
            setModalOpen(true);
          }}
          disabled={loading || Boolean(error)}
        />
      </div>

      {loading ? (
        <PageLoadingState message="Loading categories..." />
      ) : error ? (
        <PageErrorState message={error} onRetry={loadCategories} />
      ) : (
        <>
          <div className="flex-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={paginatedCategories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table columns={columns}>
                  {paginatedCategories.map((category, index) => (
                    <CategoryRow
                      key={category.id}
                      category={category}
                      onSave={handleEdit}
                      onDelete={handleDelete}
                      isLast={index === paginatedCategories.length - 1}
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

      <AddCategoryModal
        key={editTarget?.id ?? "new"}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onConfirm={handleConfirm}
        editData={editTarget}
      />
    </div>
  );
}

export default CategoriesPage;
