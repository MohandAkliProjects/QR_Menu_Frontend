import { useState, useRef } from "react";
import {
  Eye, EyeOff, Pencil, Trash2, Save,
  Upload, Image as ImageIcon, Heart,
} from "lucide-react";
import Badge from "../Badge";
import TableCell from "../table/TableCell";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Dish } from "../../../types/dish";
import type { LanguageConfig } from "../category/CategoryRow";

interface DishRowProps {
  dish: Dish;
  onSave: (updated: Dish) => void;
  onDelete: (id: UniqueIdentifier) => void;
  isLast?: boolean;
  languages: LanguageConfig;
}

function DishRow({ dish, onSave, onDelete, isLast, languages }: DishRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Dish>(dish);
  const [error, setError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dish.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, image: reader.result as string }));
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
    setForm(dish);
    setError("");
    setIsEditing(false);
  };

  const handleToggleStatus = () => {
    const updated = {
      ...dish,
      status: dish.status === "visible" ? "hidden" : "visible",
    } as Dish;
    onSave(updated);
  };

  const handleToggleAvailable = () => {
    const updated = {
      ...dish,
      available: dish.available === "available" ? "unavailable" : "available",
    } as Dish;
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
          {dish.order}
        </div>
      </TableCell>

      {/* Image */}
      <TableCell>
        <div
          onClick={() => isEditing && imageInputRef.current?.click()}
          className={`w-10 h-10 flex items-center justify-center mx-auto rounded-lg border border-beige-400 bg-cream-300 overflow-hidden ${isEditing ? "cursor-pointer hover:border-primary-500" : ""}`}
        >
          {form.image ? (
            <img src={form.image} alt="" className="w-full h-full object-cover" />
          ) : isEditing ? (
            <Upload size={16} className="text-text-400" />
          ) : (
            <ImageIcon size={16} className="text-text-300" />
          )}
        </div>
        {isEditing && (
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
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
            {dish.english}
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
            {dish.french ?? "—"}
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
            {dish.arabic ?? "—"}
          </span>
        )}
      </TableCell>


{/* Description */}
<TableCell>
  {isEditing ? (
    <textarea
      value={form.description ?? ""}
      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
      rows={2}
      className="
        w-full px-3 py-2 rounded-lg border border-beige-400
        text-sm text-dark-700 bg-cream-200
        focus:outline-none focus:border-primary-500
        resize-none overflow-y-auto max-h-[80px]
      "
    />
  ) : (
    <div className="max-w-[180px] mx-auto">
      <p className="
        text-sm text-text-600 text-center
        overflow-y-auto
        max-h-[48px]
        leading-6
        break-words
      ">
        {dish.description || "—"}
      </p>
    </div>
  )}
</TableCell>

      {/* Price */}
      <TableCell>
        {isEditing ? (
          <div className="flex items-center gap-1 justify-center">
            <span className="text-sm text-text-400">$</span>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
              className="w-20 h-9 px-2 rounded-lg border border-beige-400 text-sm text-center text-dark-700 bg-cream-200 focus:outline-none focus:border-primary-500"
            />
          </div>
        ) : (
          <span className="text-sm text-text-600">$ {dish.price}</span>
        )}
      </TableCell>

      {/* Available */}
      <TableCell>
        <div className="flex justify-center" onClick={handleToggleAvailable}>
          <Badge variant={dish.available} />
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        <div className="flex justify-center">
          <Badge variant={dish.status} />
        </div>
      </TableCell>

      {/* Likes */}
      <TableCell>
        <div className="flex items-center justify-center gap-1">
          <Heart
            size={15}
            className={dish.likes > 0 ? "text-error fill-error" : "text-text-300"}
          />
          <span className="text-sm text-text-400">{dish.likes}</span>
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
              {dish.status === "visible" ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-beige-200 hover:text-primary-700 transition-colors"
            >
              <Pencil size={17} />
            </button>
            <button
              onClick={() => onDelete(dish.id)}
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

export default DishRow;