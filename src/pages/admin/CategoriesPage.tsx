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
import * as menuService from "../../services/menu.service";
import type { Language } from "../../types/enums";

const ITEMS_PER_PAGE = 10;

function CategoriesPage() {
  const { menuId, restaurantId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor));

  const loadData = useCallback(async (signal?: { cancelled: boolean }) => {
    if (!menuId || !restaurantId) {
      if (!signal?.cancelled) {
        setError("No menu found for this restaurant. Please create a menu first.");
        setLoading(false);
      }
      return;
    }

    if (!signal?.cancelled) {
      setLoading(true);
      setError(null);
    }

    try {
      const [categoriesData, menusData] = await Promise.all([
        categoryService.getCategoriesByMenu(menuId),
        menuService.getMenusByRestaurant(restaurantId),
      ]);

      if (!signal?.cancelled) {
        const activeMenu = menusData.find((m) => m.id === menuId);
        const langs = activeMenu
          ? (Object.keys(activeMenu.translations).map((k) => k.toUpperCase()) as Language[])
          : [];
        setSupportedLanguages(langs);
        setCategories(categoriesData.map(categoryResponseToUI));
      }
    } catch (err) {
      if (!signal?.cancelled) {
        const message = getErrorMessage(err, "Could not load categories.");
        setError(message);
        showToast("error", "Load Failed", message);
      }
    } finally {
      if (!signal?.cancelled) setLoading(false);
    }
  }, [menuId, restaurantId, showToast]);

  useEffect(() => {
    const signal = { cancelled: false };
    async function run() {
      await loadData(signal);
    }
    run();
    return () => { signal.cancelled = true; };
  }, [loadData]);

  const languages: LanguageConfig = {
    showEnglish: supportedLanguages.includes("EN" as Language),
    showFrench: supportedLanguages.includes("FR" as Language),
    showArabic: supportedLanguages.includes("AR" as Language),
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
      await loadData();
      showToast("error", "Reorder Failed", getErrorMessage(err));
    }
  };

  const handleConfirm = async (
    data: Omit<Category, "id" | "order"> & { iconFile: File | null }
  ) => {
    if (!menuId) return;

    try {
      if (editTarget) {
        const requestBody = {
          translations: categoryUIToTranslations(data),
          isVisible: data.status === "visible",
        };

        console.log(
          "CATEGORY UPDATE:",
          JSON.stringify(requestBody, null, 2)
        );

        const updated = await categoryService.updateCategory(
          String(editTarget.id),
          requestBody,
          data.iconFile
        );

        setCategories((prev) =>
          prev.map((c) =>
            c.id === editTarget.id ? categoryResponseToUI(updated) : c
          )
        );

        showToast("success", "Category Updated", "Category has been updated successfully.");
      } else {
        const requestBody = {
          translations: categoryUIToTranslations(data),
          isVisible: data.status === "visible",
        };

        console.log(
          "CATEGORY REQUEST:",
          JSON.stringify(requestBody, null, 2)
        );

        const created = await categoryService.createCategory(
          menuId,
          requestBody,
          data.iconFile
        );

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
    showToast("error", "Not Available", "Category deletion is not enabled on the server yet.");
  };

  const handleEdit = async (category: Category, iconFile: File | null) => {
    const previous = categories.find((c) => c.id === category.id);
    if (!previous) return;

    const onlyStatusChanged =
      previous.english === category.english &&
      previous.french === category.french &&
      previous.arabic === category.arabic &&
      previous.icon === category.icon &&
      previous.status !== category.status &&
      !iconFile;

    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? category : c))
    );

    try {
      const response = onlyStatusChanged
        ? await categoryService.toggleCategoryVisible(String(category.id))
        : await categoryService.updateCategory(
            String(category.id),
            {
              translations: categoryUIToTranslations(category),
              isVisible: category.status === "visible",
            },
            iconFile
          );

      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? categoryResponseToUI(response) : c))
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

      {!loading && !error && categoriesWithMissing.length > 0 && (
        <Notification
          variant="warning"
          title="Missing Translations"
          message={`${categoriesWithMissing.length} category${
            categoriesWithMissing.length > 1 ? "ies have" : " has"
          } missing translations. Edit them to add all required languages.`}
          className="mb-6"
        />
      )}

      {loading ? (
        <PageLoadingState message="Loading categories..." />
      ) : error ? (
        <PageErrorState message={error} onRetry={() => loadData()} />
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