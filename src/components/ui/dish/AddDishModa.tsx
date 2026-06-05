import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";
import CategoryImageUpload from "../category/CategoryImageUpload";
import { Trash2, Check } from "lucide-react";
import type { Dish } from "../../../types/dish";
import type { UniqueIdentifier } from "@dnd-kit/core";

interface Category {
  id: UniqueIdentifier;
  label: string;
}

interface AddDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Omit<Dish, "id" | "order" | "likes">) => void;
  editData?: Dish | null;
  categories: Category[];
}

type FormState = Omit<Dish, "id" | "order" | "likes">;

const EMPTY: FormState = {
  english: "",
  french: "",
  arabic: "",
  description: "",
  image: null,
  price: 0,
  available: "available",
  status: "visible",
  categoryId: "",
};

function AddDishModal({ isOpen, onClose, onConfirm, editData, categories }: AddDishModalProps) {
  const [form, setForm] = useState<FormState>(
    editData
      ? {
          english: editData.english,
          french: editData.french ?? "",
          arabic: editData.arabic ?? "",
          description: editData.description ?? "",
          image: editData.image,
          price: editData.price,
          available: editData.available,
          status: editData.status,
          categoryId: editData.categoryId,
        }
      : EMPTY
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.english.trim()) newErrors.english = "English name is required.";
    if (!form.price || form.price <= 0) newErrors.price = "Price must be greater than 0.";
    if (!form.categoryId) newErrors.categoryId = "Please select a category.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm(form);
    onClose();
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      title={editData ? "Edit Dish" : "Add New Dish"}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex gap-4 w-full">
          <Button
            label="Cancel"
            icon={Trash2}
            onClick={handleCancel}
            fullWidth
            className="!bg-transparent !border !border-error !text-error hover:!bg-error/10"
          />
          <Button
            label="Confirme"
            icon={Check}
            onClick={handleConfirm}
            fullWidth
          />
        </div>
      }
    >
      {/* Image Upload */}
      <div className="w-full">
        <CategoryImageUpload
          preview={form.image}
          onChange={(_, preview) => setForm((prev) => ({ ...prev, image: preview }))}
        />
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-600">English</label>
          <Input
            value={form.english}
            placeholder="name"
            onChange={(e) => setForm((p) => ({ ...p, english: e.target.value }))}
            error={errors.english}
          />
          {errors.english && <span className="text-xs text-error">{errors.english}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-600">Francais</label>
          <Input
            value={form.french ?? ""}
            placeholder="name"
            onChange={(e) => setForm((p) => ({ ...p, french: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-600">Arabic</label>
          <Input
            value={form.arabic ?? ""}
            placeholder="name"
            onChange={(e) => setForm((p) => ({ ...p, arabic: e.target.value }))}
          />
        </div>
      </div>

      {/* Price + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-600">Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-400">$</span>
            <input
              type="number"
              value={form.price}
              placeholder="0"
              onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
              className={`
                w-full h-12 pl-8 pr-4 rounded-xl
                bg-card-bg border text-base text-text-800
                focus:outline-none transition-all duration-200
                shadow-[var(--shadow-card)]
                ${errors.price ? "border-error" : "border-primary-200 focus:border-primary-500"}
              `}
            />
          </div>
          {errors.price && <span className="text-xs text-error">{errors.price}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-600">Categorie</label>
          <select
            value={String(form.categoryId)}
            onChange={(e) => setForm((p) => ({ ...p, categoryId: Number(e.target.value) }))}
            className={`
              w-full h-12 px-4 rounded-xl
              bg-card-bg border text-base text-text-800
              focus:outline-none transition-all duration-200
              shadow-[var(--shadow-card)]
              ${errors.categoryId ? "border-error" : "border-primary-200 focus:border-primary-500"}
            `}
          >
            <option value="">name of categorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.categoryId && <span className="text-xs text-error">{errors.categoryId}</span>}
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-600">Description</label>
        <textarea
          value={form.description ?? ""}
          placeholder="Add description of dish"
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={3}
          className="
            w-full px-4 py-3 rounded-xl
            bg-card-bg border border-primary-200
            text-base text-text-800
            focus:outline-none focus:border-primary-500
            shadow-[var(--shadow-card)]
            transition-all duration-200
            resize-none
          "
        />
      </div>
    </Modal>
  );
}

export default AddDishModal;