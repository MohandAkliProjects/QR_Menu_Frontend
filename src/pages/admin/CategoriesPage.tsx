import { useState } from "react";
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
  arrayMove,
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
import type { Language } from "../../types/enums";

const ITEMS_PER_PAGE = 10;

function CategoriesPage() {
  const { menuId, restaurantId } = useAuth();
  const queryClient = useQueryClient();
  const { toasts, showToast, removeToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // For drag reorder — we keep a local reordered list only during/after drag
  // until invalidation resolves
  const [localCategories, setLocalCategories] = useState<Category[] | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const categoriesKey = ["categories", restaurantId, menuId];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: categoriesKey,
    queryFn: () =>
      categoryService.loadCategoriesPageData(restaurantId!, menuId!),
    enabled: !!menuId && !!restaurantId,
  });

  const categories: Category[] = (localCategories ?? data?.categories.map(categoryResponseToUI)) ?? [];
  const supportedLanguages: Language[] = data?.supportedLanguages ?? [];

  const languages: LanguageConfig = {
    showEnglish: supportedLanguages.includes("EN" as Language),
    showFrench: supportedLanguages.includes("FR" as Language),
    showArabic: supportedLanguages.includes("AR" as Language),
  };


  const createMutation = useMutation({
    mutationFn: ({
      data,
      iconFile,
    }: {
      data: Parameters<typeof categoryService.createCategory>[1];
      iconFile: File | null;
    }) => categoryService.createCategory(menuId!, data, iconFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      setCurrentPage(1);
      showToast("success", "Category Added", "New category has been added successfully.");
    },
    onError: (err) => showToast("error", "Save Failed", getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
      iconFile,
    }: {
      id: string;
      data: Parameters<typeof categoryService.updateCategory>[1];
      iconFile: File | null;
    }) => categoryService.updateCategory(id, data, iconFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      showToast("success", "Category Updated", "Category has been updated successfully.");
    },
    onError: (err) => showToast("error", "Save Failed", getErrorMessage(err)),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => categoryService.toggleCategoryVisible(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      showToast("success", "Category Saved", "Your changes have been saved.");
    },
    onError: (err) => showToast("error", "Save Failed", getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      showToast("success", "Category Deleted", "Category has been removed.");
    },
    onError: (err) => showToast("error", "Delete Failed", getErrorMessage(err)),
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) =>
      categoryService.reorderCategories(menuId!, { orderedCategoriesIds: orderedIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      setLocalCategories(null);
      showToast("success", "Order Updated", "Category order has been saved.");
    },
    onError: (err) => {
      setLocalCategories(null);
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      showToast("error", "Reorder Failed", getErrorMessage(err));
    },
  });


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !menuId) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex).map((c, i) => ({
      ...c,
      order: i + 1,
    }));

    setLocalCategories(reordered);
    reorderMutation.mutate(reordered.map((c) => String(c.id)));
  };

  const handleConfirm = (
    formData: Omit<Category, "id" | "order"> & { iconFile: File | null }
  ) => {
    if (!menuId) return;

    if (editTarget) {
      updateMutation.mutate({
        id: String(editTarget.id),
        data: {
          translations: categoryUIToTranslations(formData),
          isVisible: formData.status === "visible",
        },
        iconFile: formData.iconFile,
      });
    } else {
      createMutation.mutate({
        data: {
          translations: categoryUIToTranslations(formData),
          isVisible: formData.status === "visible",
        },
        iconFile: formData.iconFile,
      });
    }
    setEditTarget(null);
  };

  const handleEdit = (category: Category, iconFile: File | null) => {
    const previous = categories.find((c) => c.id === category.id);
    if (!previous) return;

    const onlyStatusChanged =
      previous.english === category.english &&
      previous.french === category.french &&
      previous.arabic === category.arabic &&
      previous.icon === category.icon &&
      previous.status !== category.status &&
      !iconFile;

    if (onlyStatusChanged) {
      toggleMutation.mutate(String(category.id));
    } else {
      updateMutation.mutate({
        id: String(category.id),
        data: {
          translations: categoryUIToTranslations(category),
          isVisible: category.status === "visible",
        },
        iconFile,
      });
    }
  };

  const handleDelete = (id: UniqueIdentifier) => {
    deleteMutation.mutate(String(id));
  };


  const categoriesWithMissing = categories.filter((c) => {
    if (languages.showEnglish && !c.english) return true;
    if (languages.showFrench && !c.french) return true;
    if (languages.showArabic && !c.arabic) return true;
    return false;
  });

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

  const noMenuError = !menuId || !restaurantId
    ? "No menu found for this restaurant. Please create a menu first."
    : null;

  return (
    <div className="flex flex-col  p-6 sm:p-8 lg:p-10 w-full">
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
          disabled={isLoading || isError || !!noMenuError}
        />
      </div>

      {!isLoading && !isError && !noMenuError && categoriesWithMissing.length > 0 && (
        <Notification
          variant="warning"
          title="Missing Translations"
          message={`${categoriesWithMissing.length} categor${
            categoriesWithMissing.length > 1 ? "ies have" : "y has"
          } missing translations. Edit them to add all required languages.`}
          className="mb-6"
        />
      )}

      {noMenuError ? (
        <PageErrorState message={noMenuError} />
      ) : isLoading ? (
        <PageLoadingState message="Loading categories..." />
      ) : isError ? (
        <PageErrorState
          message={getErrorMessage(error, "Could not load categories.")}
          onRetry={refetch}
        />
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
        supportedLanguages={supportedLanguages}
      />
    </div>
  );
}

export default CategoriesPage;