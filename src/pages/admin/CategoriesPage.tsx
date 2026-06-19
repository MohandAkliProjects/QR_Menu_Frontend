import { useState } from "react";
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
  arrayMove,
} from "@dnd-kit/sortable";

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
  type LanguageConfig,
} from "../../components/ui/category/CategoryRow";
import AddCategoryModal from "../../components/ui/category/AddCategoryModal";
import ToastContainer from "../../components/ui/ToastContainer";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/useLanguage";
import useToast from "../../hooks/useToast";
import { categoryResponseToUI } from "../../lib/mappers";
import * as categoryService from "../../services/category.service";
import type { Language } from "../../types/enums";
import type { CategoryUI as Category } from "../../types/ui.ts";
import type { CategoryResponse } from "../../types/api";
import type { CategoriesPageData } from "../../types/ui.ts";
import { categoriesText } from "./text/CategoriesPage.text.ts";

const ITEMS_PER_PAGE = 1000;

function CategoriesPage() {
  const { menuId, restaurantId } = useAuth();
  const queryClient = useQueryClient();
  const { toasts, showToast, removeToast } = useToast();
  const { language } = useLanguage();
  const t = categoriesText[language];

  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const categoriesKey = ["categories", restaurantId, menuId];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: categoriesKey,
    queryFn: () =>
      categoryService.loadCategoriesPageData(restaurantId!, menuId!),
    enabled: !!menuId && !!restaurantId,
  });

  const categories: Category[] =
    data?.categories.map(categoryResponseToUI) ?? [];

  const supportedLanguages: Language[] = data?.supportedLanguages ?? [];

  const languages: LanguageConfig = {
    showEnglish: supportedLanguages.includes("EN" as Language),
    showFrench: supportedLanguages.includes("FR" as Language),
    showArabic: supportedLanguages.includes("AR" as Language),
  };

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) =>
      categoryService.reorderCategories(menuId!, {
        orderedCategoriesIds: orderedIds,
      }),

    onMutate: async (orderedIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: categoriesKey });
      const previous =
        queryClient.getQueryData<CategoriesPageData>(categoriesKey);

      queryClient.setQueryData<CategoriesPageData>(categoriesKey, (old) => {
        if (!old) return old;
        const map = new Map(old.categories.map((cat) => [cat.id, cat]));
        return {
          ...old,
          categories: orderedIds
            .map((id) => map.get(id))
            .filter(Boolean) as CategoryResponse[],
        };
      });

      return { previous };
    },

    onError: (err, _variables, context) => {
      queryClient.setQueryData<CategoriesPageData>(
        categoriesKey,
        context?.previous,
      );
      showToast("error", t.reorderFailedTitle, getErrorMessage(err));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
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

    reorderMutation.mutate(reordered.map((c) => String(c.id)));
  };

  const categoriesWithMissing = categories.filter((c) => {
    if (languages.showEnglish && !c.english) return true;
    if (languages.showFrench && !c.french) return true;
    if (languages.showArabic && !c.arabic) return true;
    return false;
  });

  const totalPages = Math.max(1, Math.ceil(categories.length / ITEMS_PER_PAGE));
  const paginatedCategories = categories;

  const columns: Column[] = [
    { key: "order", label: t.colOrder, center: true, width: "min-w-[80px]" },
    { key: "icon", label: t.colIcon, center: true, width: "min-w-[80px]" },
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
    { key: "status", label: t.colStatus, center: true, width: "min-w-[120px]" },
    { key: "actions", label: t.colActions, center: true, width: "min-w-[140px]" },
  ];

  const noMenuError =
    !menuId || !restaurantId ? t.noMenuError : null;

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
          label={t.addCategory}
          icon={Plus}
          onClick={() => setModalOpen(true)}
          disabled={isLoading || isError || !!noMenuError}
        />
      </div>

      {!isLoading &&
        !isError &&
        !noMenuError &&
        categoriesWithMissing.length > 0 && (
          <Notification
            variant="warning"
            title={t.missingTranslationsTitle}
            message={`${categoriesWithMissing.length} ${
              categoriesWithMissing.length > 1
                ? t.missingTranslationsPlural
                : t.missingTranslationsSingle
            }`}
            className="mb-6"
          />
        )}

      {noMenuError ? (
        <PageErrorState message={noMenuError} />
      ) : isLoading ? (
        <PageLoadingState message={t.loading} />
      ) : isError ? (
        <PageErrorState
          message={getErrorMessage(error, t.loadError)}
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
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setCurrentPage(1)}
        supportedLanguages={supportedLanguages}
      />
    </div>
  );
}

export default CategoriesPage;