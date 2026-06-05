import { useState } from "react";
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

import PageHeader from "../../components/shared/PageHeader";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import Table from "../../components/ui/table/Table";
import type { Column } from "../../components/ui/table/Table";
import CategoryRow, { type Category, type LanguageConfig } from "../../components/ui/category/CategoryRow";
import AddCategoryModal from "../../components/ui/category/AddCategoryModal";
import ToastContainer from "../../components/ui/ToastContainer";
import useToast from "../../hooks/useToast";

const ITEMS_PER_PAGE = 10;

const MOCK: Category[] = [
  { id: 1,  order: 1,  icon: null, english: "Appetizers",   french: "Apéritifs",  arabic: "مقبلات",           status: "visible" },
  { id: 2,  order: 2,  icon: null, english: "Salads",       french: "Salades",    arabic: "سلطات",            status: "visible" },
  { id: 3,  order: 3,  icon: null, english: "Grills",       french: "Grillades",  arabic: "مشويات",           status: "visible" },
  { id: 4,  order: 4,  icon: null, english: "Burgers",      french: "Burgers",    arabic: "برغر",             status: "hidden"  },
  { id: 5,  order: 5,  icon: null, english: "Pizzas",       french: "Pizzas",     arabic: "بيتزا",            status: "visible" },
  { id: 6,  order: 6,  icon: null, english: "Desserts",     french: "Desserts",   arabic: "حلويات",           status: "visible" },
  { id: 7,  order: 7,  icon: null, english: "Drinks",       french: "Boissons",   arabic: "مشروبات",          status: "visible" },
  { id: 8,  order: 8,  icon: null, english: "Main Courses", french: "Plat Cours", arabic: "الأطباق الرئيسية", status: "hidden"  },
];

const languages: LanguageConfig = {
  showEnglish: true,
  showFrench: true,
  showArabic: true,
};

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(MOCK);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toasts, showToast, removeToast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor));

  // ── pagination ──────────────────────────────────────
  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns: Column[] = [
    { key: "order",   label: "Order",    center: true, width: "min-w-[80px]"  },
    { key: "icon",    label: "Icon",     center: true, width: "min-w-[80px]"  },
    { key: "english", label: "English",  center: true, width: "min-w-[140px]", hidden: !languages.showEnglish },
    { key: "french",  label: "Français", center: true, width: "min-w-[140px]", hidden: !languages.showFrench  },
    { key: "arabic",  label: "Arabic",   center: true, width: "min-w-[140px]", hidden: !languages.showArabic  },
    { key: "status",  label: "Status",   center: true, width: "min-w-[120px]" },
    { key: "actions", label: "Actions",  center: true, width: "min-w-[140px]" },
  ];

  // ── drag end ─────────────────────────────────────────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setCategories((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id);
      const newIndex = prev.findIndex((c) => c.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((c, i) => ({ ...c, order: i + 1 }));
    });
  };

  // ── add / update from modal ───────────────────────────
  const handleConfirm = (data: Omit<Category, "id" | "order">) => {
    try {
      if (editTarget) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editTarget.id ? { ...c, ...data } : c))
        );
        showToast("success", "Category Updated", "Category has been updated successfully.");
      } else {
        setCategories((prev) => [
          ...prev,
          { ...data, id: Date.now(), order: prev.length + 1 },
        ]);
        setCurrentPage(1);
        showToast("success", "Category Added", "New category has been added successfully.");
      }
      setEditTarget(null);
    } catch {
      showToast("error", "Something went wrong", "Please try again.");
    }
  };

  // ── delete ────────────────────────────────────────────
  const handleDelete = (id: UniqueIdentifier) => {
    try {
      setCategories((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        return filtered.map((c, i) => ({ ...c, order: i + 1 }));
      });
      showToast("success", "Category Deleted", "Category has been removed.");
    } catch {
      showToast("error", "Something went wrong", "Please try again.");
    }
  };

  // ── inline save ───────────────────────────────────────
  const handleEdit = (category: Category) => {
    try {
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? category : c))
      );
      showToast("success", "Category Saved", "Your changes have been saved.");
    } catch {
      showToast("error", "Something went wrong", "Please try again.");
    }
  };

 return (
  <div className="flex flex-col min-h-full p-6 sm:p-8 lg:p-10 w-full">

    <ToastContainer toasts={toasts} onClose={removeToast} />

    {/* Header */}
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
      />
    </div>

    {/* Table — takes all available space */}
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

    {/* Pagination — always at bottom */}
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />

    {/* Modal */}
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