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
import DishRow from "../../components/ui/dish/DishRow";
import CategoryFilterBar from "../../components/ui/dish/CategoryFilterBar";
import ToastContainer from "../../components/ui/ToastContainer";
import useToast from "../../hooks/useToast";
import type { Dish } from "../../types/dish";
import AddDishModal from "../../components/ui/dish/AddDishModa";
import type { LanguageConfig } from "../../components/ui/category/CategoryRow";

const ITEMS_PER_PAGE = 10;

const MOCK_CATEGORIES = [
  { id: 1, label: "Appetizers" },
  { id: 2, label: "Salads" },
  { id: 3, label: "Pasta" },
  { id: 4, label: "Main Courses" },
  { id: 5, label: "Soups" },
  { id: 6, label: "Desserts" },
];

const MOCK_DISHES: Dish[] = [
  { id: 1, order: 1, image: null, english: "Grilled Chicken",   french: "Poulet Grillé",       arabic: "دجاج مشوي",         price: 25, available: "available", status: "visible", likes: 150, categoryId: 4 },
  { id: 2, order: 2, image: null, english: "Beef Burger",       french: "Burger au Bœuf",      arabic: "برغر لحم",          price: 25, available: "available", status: "visible", likes: 150, categoryId: 1 },
  { id: 3, order: 3, image: null, english: "Margherita Pizza",  french: "Pizza Margherita",    arabic: "بيتزا مارغريتا",    price: 25, available: "available", status: "visible", likes: 150, categoryId: 4 },
  { id: 4, order: 4, image: null, english: "Chicken Alfredo",   french: "Pâtes Alfredo",       arabic: "باستا ألفريدو",     price: 25, available: "available", status: "visible", likes: 150, categoryId: 3 },
  { id: 5, order: 5, image: null, english: "Caesar Salad",      french: "Salade César",        arabic: "سلطة سيزر",         price: 25, available: "available", status: "visible", likes: 150, categoryId: 2 },
  { id: 6, order: 6, image: null, english: "Tomato Soup",       french: "Soupe à la Tomate",   arabic: "شوربة الطماطم",     price: 25, available: "available", status: "visible", likes: 150, categoryId: 5 },
  { id: 7, order: 7, image: null, english: "Chocolate Cake",    french: "Gâteau au Chocolat",  arabic: "كعكة الشوكولاتة",   price: 25, available: "available", status: "visible", likes: 150, categoryId: 6 },
  { id: 8, order: 8, image: null, english: "Orange Juice",      french: "Jus d'Orange",        arabic: "عصير برتقال",       price: 25, available: "available", status: "visible", likes: 150, categoryId: 1 },
];

const languages: LanguageConfig = {
  showEnglish: true,
  showFrench: true,
  showArabic: true,
};

function DishesPage() {
  const [dishes, setDishes]               = useState<Dish[]>(MOCK_DISHES);
  const [selectedCategory, setSelectedCategory] = useState<UniqueIdentifier | "all">("all");
  const [currentPage, setCurrentPage]     = useState(1);
  const { toasts, showToast, removeToast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor));

  const columns: Column[] = [
    { key: "order",     label: "Order",     center: true, width: "min-w-[80px]"  },
    { key: "image",     label: "Icon",      center: true, width: "min-w-[80px]"  },
    { key: "english",   label: "English",   center: true, width: "min-w-[140px]", hidden: !languages.showEnglish },
    { key: "french",    label: "Français",  center: true, width: "min-w-[140px]", hidden: !languages.showFrench  },
    { key: "arabic",    label: "Arabic",    center: true, width: "min-w-[140px]", hidden: !languages.showArabic  },
   { key: "description", label: "Description", center: true, width: "min-w-[200px]" },
    { key: "price",     label: "Price",     center: true, width: "min-w-[100px]" },
    { key: "available", label: "Available", center: true, width: "min-w-[120px]" },
    { key: "status",    label: "Status",    center: true, width: "min-w-[120px]" },
    { key: "likes",     label: "Likes",     center: true, width: "min-w-[100px]" },
    { key: "actions",   label: "Actions",   center: true, width: "min-w-[140px]" },
  ];


  const [modalOpen, setModalOpen] = useState(false);
const [editTarget, setEditTarget] = useState<Dish | null>(null);

const handleConfirm = (data: Omit<Dish, "id" | "order" | "likes">) => {
  try {
    if (editTarget) {
      setDishes((prev) =>
        prev.map((d) => (d.id === editTarget.id ? { ...d, ...data } : d))
      );
      showToast("success", "Dish Updated", "Dish has been updated successfully.");
    } else {
      setDishes((prev) => [
        ...prev,
        { ...data, id: Date.now(), order: prev.length + 1, likes: 0 },
      ]);
      showToast("success", "Dish Added", "New dish has been added successfully.");
    }
    setEditTarget(null);
  } catch {
    showToast("error", "Something went wrong", "Please try again.");
  }
};

  // filter by category
  const filteredDishes = selectedCategory === "all"
    ? dishes
    : dishes.filter((d) => d.categoryId === selectedCategory);

  // pagination
  const totalPages = Math.ceil(filteredDishes.length / ITEMS_PER_PAGE);
  const paginatedDishes = filteredDishes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDishes((prev) => {
      const oldIndex = prev.findIndex((d) => d.id === active.id);
      const newIndex = prev.findIndex((d) => d.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((d, i) => ({ ...d, order: i + 1 }));
    });
  };

  const handleEdit = (dish: Dish) => {
    try {
      setDishes((prev) => prev.map((d) => (d.id === dish.id ? dish : d)));
      showToast("success", "Dish Saved", "Your changes have been saved.");
    } catch {
      showToast("error", "Something went wrong", "Please try again.");
    }
  };

  const handleDelete = (id: UniqueIdentifier) => {
    try {
      setDishes((prev) => {
        const filtered = prev.filter((d) => d.id !== id);
        return filtered.map((d, i) => ({ ...d, order: i + 1 }));
      });
      showToast("success", "Dish Deleted", "Dish has been removed.");
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
/>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <CategoryFilterBar
          categories={MOCK_CATEGORIES}
          selected={selectedCategory}
          onSelect={(id) => {
            setSelectedCategory(id);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table */}
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <AddDishModal
  key={editTarget?.id ?? "new"}
  isOpen={modalOpen}
  onClose={() => {
    setModalOpen(false);
    setEditTarget(null);
  }}
  onConfirm={handleConfirm}
  editData={editTarget}
  categories={MOCK_CATEGORIES}
/>

    </div>
  );
}

export default DishesPage;