import { useState, useRef } from "react";
import {
  Eye, EyeOff, Pencil, Trash2, Save,
  Upload, Image as ImageIcon,
} from "lucide-react";
import Badge from "../Badge";
import TableCell from "../table/TableCell";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface Category {
  id: UniqueIdentifier;
  order: number;
  icon: string | null;
  english: string;
  french?: string;
  arabic?: string;
  status: "visible" | "hidden";
}

export interface LanguageConfig {
  showEnglish: boolean;
  showFrench: boolean;
  showArabic: boolean;
}

interface CategoryRowProps {
  category: Category;
  onSave: (updated: Category) => void;
  onDelete: (id: UniqueIdentifier) => void;
  isLast?: boolean;
  languages: LanguageConfig;
}

function CategoryRow({ category, onSave, onDelete, isLast, languages }: CategoryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Category>(category);
  const [error, setError] = useState("");
  const iconInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, icon: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.english.trim()) {
      setError("English name is required.");
      return;
    }
    setError("");
    onSave(form);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setForm(category);
    setError("");
    setIsEditing(false);
  };

  const handleToggleStatus = () => {
    const updated = {
      ...category,
      status: category.status === "visible" ? "hidden" : "visible",
    } as Category;
    onSave(updated);
  };

  const inputClass = "w-full h-9 px-3 rounded-lg border border-beige-400 text-sm text-center text-dark-700 bg-cream-200 focus:outline-none focus:border-primary-500";

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`
        bg-card-bg transition-colors hover:bg-beige-50
        ${!isLast ? "border-b border-beige-300" : ""}
        ${isDragging ? "opacity-40" : ""}
      `}
    >
      {/* Order */}
      <TableCell>
        <div
          {...attributes}
          {...listeners}
          className="w-9 h-9 flex items-center justify-center mx-auto rounded-lg border border-beige-400 bg-cream-300 text-sm font-medium text-text-500 cursor-grab active:cursor-grabbing select-none"
        >
          {category.order}
        </div>
      </TableCell>

      {/* Icon */}
      <TableCell>
        <div
          onClick={() => isEditing && iconInputRef.current?.click()}
          className={`w-10 h-10 flex items-center justify-center mx-auto rounded-lg border border-beige-400 bg-cream-300 overflow-hidden ${isEditing ? "cursor-pointer hover:border-primary-500" : ""}`}
        >
          {form.icon ? (
            <img src={form.icon} alt="" className="w-full h-full object-cover" />
          ) : isEditing ? (
            <Upload size={16} className="text-text-400" />
          ) : (
            <ImageIcon size={16} className="text-text-300" />
          )}
        </div>
        {isEditing && (
          <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
        )}
      </TableCell>

      {/* English */}
      <TableCell hidden={!languages.showEnglish}>
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <input
              value={form.english}
              onChange={(e) => setForm((p) => ({ ...p, english: e.target.value }))}
              className={`${inputClass} ${error ? "border-error" : ""}`}
            />
            {error && <span className="text-xs text-error text-center">{error}</span>}
          </div>
        ) : (
          <span className="text-sm text-text-600 truncate block max-w-[140px] mx-auto">
            {category.english}
          </span>
        )}
      </TableCell>

      {/* French */}
      <TableCell hidden={!languages.showFrench}>
        {isEditing ? (
          <input
            value={form.french ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, french: e.target.value }))}
            className={inputClass}
          />
        ) : (
          <span className="text-sm text-text-600 truncate block max-w-[140px] mx-auto">
            {category.french ?? "—"}
          </span>
        )}
      </TableCell>

      {/* Arabic */}
      <TableCell hidden={!languages.showArabic}>
        {isEditing ? (
          <input
            value={form.arabic ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, arabic: e.target.value }))}
            dir="rtl"
            className={inputClass}
          />
        ) : (
          <span className="text-sm text-text-600 truncate block max-w-[140px] mx-auto" dir="rtl">
            {category.arabic ?? "—"}
          </span>
        )}
      </TableCell>

      {/* Status */}
      <TableCell>
        <div className="flex justify-center">
          <Badge variant={category.status} />
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell>
        {isEditing ? (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleCancel}
              className="h-9 px-3 rounded-lg border border-beige-400 text-sm text-text-600 hover:bg-beige-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="h-9 px-4 flex items-center gap-2 rounded-lg bg-primary-700 text-cream-500 text-sm font-medium hover:bg-primary-700/90 transition-colors"
            >
              <Save size={15} />
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={handleToggleStatus}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-beige-200 hover:text-primary-700 transition-colors"
            >
              {category.status === "visible" ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-beige-200 hover:text-primary-700 transition-colors"
            >
              <Pencil size={17} />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-error hover:bg-error-bg transition-colors"
            >
              <Trash2 size={17} />
            </button>
          </div>
        )}
      </TableCell>
    </tr>
  );
}

export default CategoryRow;