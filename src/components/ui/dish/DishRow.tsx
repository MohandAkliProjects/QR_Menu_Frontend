import { useState, useRef } from "react";
import {
  Pencil,
  Trash2,
  Save,
  Upload,
  Image as ImageIcon,
  Heart,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import Badge from "../Badge";
import TableCell from "../table/TableCell";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Dish } from "../../../types/dish";
import type { LanguageConfig } from "../category/CategoryRow";
import useToast from "../../../hooks/useToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../api/errors";
import * as dishService from "../../../services/dish.service";
import type { AllDishesResponse, UpdateDishRequest } from "../../../services/dish.service";
import { useAuth } from "../../../context/AuthContext";

interface DishRowProps {
  dish: Dish;
  onDelete: (id: UniqueIdentifier) => void;
  isLast?: boolean;
  languages: LanguageConfig;
}

function DishUItoUpdateDishRequest(dish: Dish): UpdateDishRequest {
  return {
    englishName: dish.english,
    frenchName: dish.french,
    arabicName: dish.arabic,
    englishDescription: dish.englishDescription,
    frenchDescription: dish.frenchDescription,
    arabicDescription: dish.arabicDescription,
    available: dish.available === "available" ? true : false,
    visible: dish.status === "visible" ? true : false,
    price: dish.price,
    dishId: String(dish.id),
    image: dish.image ?? undefined
  }
}

function DishRow({ dish, onDelete, isLast, languages }: DishRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateDishRequest>(DishUItoUpdateDishRequest(dish));
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

  const { showToast } = useToast();
  const { restaurantId } = useAuth();
  const queryClient = useQueryClient();
  const dishesKey = ["dishes", restaurantId];
  const updateMutation = useMutation({
    mutationFn: ({
      payload,
    }: {
      payload: UpdateDishRequest;
    }) => dishService.updateDish(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dishesKey });
      showToast(
        "success",
        "Dish Updated",
        "Dish has been updated successfully.",
      );
    },
    onError: (err) => showToast("error", "Save Failed", getErrorMessage(err)),
  });

  const toggleVisibleMutation = useMutation({
    mutationFn: (id: string) => dishService.toggleDishVisible(id),
  
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: dishesKey });
      const previous = queryClient.getQueryData<AllDishesResponse>(dishesKey);
  
      queryClient.setQueryData<AllDishesResponse>(dishesKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          menus: old.menus.map((menu) => ({
            ...menu,
            categories: menu.categories.map((cat) => ({
              ...cat,
              dishes: cat.dishes.map((dish) =>
                dish.id === id
                  ? { ...dish, isVisible: !dish.isVisible }
                  : dish
              ),
            })),
          })),
        };
      });
  
      return { previous };
    },
  
    onSuccess: () => {
      //showToast("success", "Visibility Updated", "Dish visibility has been updated.");
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData<AllDishesResponse>(dishesKey, context?.previous);
      showToast("error", "Update Failed", getErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dishesKey });
    },
  });
  
  const toggleAvailableMutation = useMutation({
    mutationFn: (id: string) => dishService.toggleDishAvailable(id),
  
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: dishesKey });
      const previous = queryClient.getQueryData<AllDishesResponse>(dishesKey);
  
      queryClient.setQueryData<AllDishesResponse>(dishesKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          menus: old.menus.map((menu) => ({
            ...menu,
            categories: menu.categories.map((cat) => ({
              ...cat,
              dishes: cat.dishes.map((dish) =>
                dish.id === id
                  ? { ...dish, isAvailable: !dish.isAvailable }
                  : dish
              ),
            })),
          })),
        };
      });
  
      return { previous };
    },
  
    onSuccess: () => {
      //showToast("success", "Availability Updated", "Dish availability has been updated.");
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData<AllDishesResponse>(dishesKey, context?.previous);
      showToast("error", "Update Failed", getErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dishesKey });
    },
  });

  const handleToggleStatus = () => {
    toggleVisibleMutation.mutate(String(dish.id));
  }

  const handleToggleAvailable = () => {
    toggleAvailableMutation.mutate(String(dish.id));
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setForm((prev) => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const isMissingEnglish =
    languages.showEnglish && (form.englishName?.trim().length ?? 0) < 1;
  const isMissingFrench =
    languages.showFrench && (form.frenchName?.trim().length ?? 0) < 1;
  const isMissingArabic =
    languages.showArabic && (form.arabicName?.trim().length ?? 0) < 1;

  const handleSave = () => {
    if (languages.showEnglish && (form.englishName?.trim().length ?? 0) < 1) {
      setError("English name is required.");
      return;
    }
    if (languages.showFrench && (form.frenchName?.trim().length ?? 0) < 1) {
      setError("French name is required.");
      return;
    }
    if (languages.showArabic && (form.arabicName?.trim().length ?? 0) < 1) {
      setError("Arabic name is required.");
      return;
    }
    setError("");
    updateMutation.mutate({payload: form});
    setIsEditing(false);
  };

  const handleCancel = () => {
    setForm(DishUItoUpdateDishRequest(dish));
    setError("");
    setIsEditing(false);
  };

  const missingClass = "border-warning bg-warning/10";
  const inputClass =
    "w-full h-9 px-3 rounded-lg border border-beige-400 text-sm text-center text-dark-700 bg-cream-200 focus:outline-none focus:border-primary-500";

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
            <img
              src={form.image}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : isEditing ? (
            <Upload size={16} className="text-text-400" />
          ) : (
            <ImageIcon size={16} className="text-text-300" />
          )}
        </div>
        {isEditing && (
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        )}
      </TableCell>

      {/* English */}
      <TableCell hidden={!languages.showEnglish}>
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <input
              value={form.englishName ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, englishName: e.target.value }))
              }
              className={`${inputClass} ${error || isMissingEnglish ? "border-error" : ""}`}
            />
            {error && (
              <span className="text-xs text-error text-center">{error}</span>
            )}
          </div>
        ) : (
          <span
            className={`text-sm truncate block max-w-35 mx-auto px-2 py-1 rounded-lg ${
              !dish.english ? `text-warning ${missingClass}` : "text-text-600"
            }`}
          >
            {dish.english || "Missing"}
          </span>
        )}
      </TableCell>

      {/* French */}
      <TableCell hidden={!languages.showFrench}>
        {isEditing ? (
          <input
            value={form.frenchName ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, frenchName: e.target.value }))}
            className={`${inputClass} ${isMissingFrench ? "border-warning" : ""}`}
          />
        ) : (
          <span
            className={`text-sm truncate block max-w-35 mx-auto px-2 py-1 rounded-lg ${
              !dish.french ? `text-warning ${missingClass}` : "text-text-600"
            }`}
          >
            {dish.french || "Missing"}
          </span>
        )}
      </TableCell>

      {/* Arabic */}
      <TableCell hidden={!languages.showArabic}>
        {isEditing ? (
          <input
            value={form.arabicName ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, arabicName: e.target.value }))}
            dir="rtl"
            className={`${inputClass} ${isMissingArabic ? "border-warning" : ""}`}
          />
        ) : (
          <span
            className={`text-sm truncate block max-w-35 mx-auto px-2 py-1 rounded-lg ${
              !dish.arabic ? `text-warning ${missingClass}` : "text-text-600"
            }`}
            dir={languages.showArabic ? "rtl" : undefined}
          >
            {dish.arabic || "Missing"}
          </span>
        )}
      </TableCell>

      {/* Description */}
      <TableCell>
        {isEditing ? (
          <textarea
            value={form.englishDescription ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, englishDescription: e.target.value }))
            }
            rows={2}
            className="
              w-full px-3 py-2 rounded-lg border border-beige-400
              text-sm text-dark-700 bg-cream-200
              focus:outline-none focus:border-primary-500
              resize-none overflow-y-auto max-h-20
            "
          />
        ) : (
          <div className="max-w-35 mx-auto">
            <p className="text-sm text-text-600 text-center overflow-y-auto max-h-12 leading-6 wrap-break-words">
              {dish.englishDescription || "—"}
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
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: Number(e.target.value) }))
              }
              className="w-20 h-9 px-2 rounded-lg border border-beige-400 text-sm text-center text-dark-700 bg-cream-200 focus:outline-none focus:border-primary-500"
            />
          </div>
        ) : (
          <span className="text-sm text-text-600">$ {dish.price}</span>
        )}
      </TableCell>

      {/* Available — clickable badge */}
      <TableCell>
        <div className="flex justify-center">
          <Badge variant={dish.available === "available" ? "available" : "hidden"} />
        </div>
      </TableCell>

      {/* Status — clickable badge */}
      <TableCell>
        <div className="flex justify-center">
          <Badge variant={dish.status === "visible" ? "visible" : "hidden"} />
        </div>
      </TableCell>

      {/* Likes */}
      <TableCell>
        <div className="flex items-center justify-center gap-1">
          <Heart
            size={15}
            className={
              dish.likes > 0 ? "text-error fill-error" : "text-text-300"
            }
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
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-beige-200 hover:text-primary-700 transition-colors hover:cursor-pointer"
              title={dish.status === "visible" ? "Hide dish" : "Show dish"}
            >
              {dish.status === "visible" ? (
                <Eye size={17} />
              ) : (
                <EyeOff size={17} />
              )}
            </button>

            {/* Availability */}
            <button
              onClick={handleToggleAvailable}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-beige-200 hover:text-primary-700 transition-colors hover:cursor-pointer"
              title={
                dish.available === "available"
                  ? "Mark unavailable"
                  : "Mark available"
              }
            >
              {dish.available === "available" ? (
                <Check size={17} />
              ) : (
                <X size={17} />
              )}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-beige-200 hover:text-primary-700 transition-colors hover:cursor-pointer"
              title="Edit dish"
            >
              <Pencil size={17} />
            </button>
            <button
              onClick={() => onDelete(dish.id)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-error/10 hover:text-error transition-colors hover:cursor-pointer"
              title="Delete dish"
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
