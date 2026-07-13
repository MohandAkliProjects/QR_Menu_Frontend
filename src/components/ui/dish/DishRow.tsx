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
} from "lucide-react";
import { CircleCheck, CircleX } from "lucide-react";
import Badge from "../Badge";
import TableCell from "../table/TableCell";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Dish } from "../../../types/dish";
import type { LanguageConfig } from "../category/CategoryRow";
import useToast from "../../../hooks/useToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../api/errors";
import * as dishService from "../../../services/dish.service";
import type { AllDishesResponse } from "../../../services/dish.service";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../i18n/useLanguage";
import ToastContainer from "../../../components/ui/ToastContainer";
import type { UpdateDishRequest } from "../../../types/api";
import type { Devise } from "../../../types";
import { dishRowText } from "../text/DishRow.text";

import NamePopover from "../Namepopover";
import { MultilingualTextPopover, MultilingualTextEditor } from "../Multilingualtextpopover";
import { SizesPopover, SizesEditor } from "../Sizespopover";
import DishSupplementsPopover from "../Dishsupplementspopover";

interface DishRowProps {
  dish: Dish;
  isLast?: boolean;
  isFirst?: boolean;
  languages: LanguageConfig;
  devise: Devise;
}

function DishUItoUpdateDishRequest(dish: Dish): UpdateDishRequest {
  return {
    englishName: dish.english,
    frenchName: dish.french,
    arabicName: dish.arabic,
    englishDescription: dish.englishDescription,
    frenchDescription: dish.frenchDescription,
    arabicDescription: dish.arabicDescription,
    available: dish.available === "available",
    visible: dish.status === "visible",
    sizes: dish.sizes.length > 0 ? dish.sizes.map((s) => ({ ...s })) : [{ name: "", price: 0 }],
    dishId: String(dish.id),
    image: dish.image ?? undefined,
  };
}

function DishRow({ dish, devise, isLast, languages }: DishRowProps) {
  const { language } = useLanguage();
  const t = dishRowText[language];

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateDishRequest>(DishUItoUpdateDishRequest(dish));
  const [error, setError] = useState("");
  const [sizesError, setSizesError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: dish.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const { toasts, showToast, removeToast } = useToast();
  const { restaurantId } = useAuth();
  const queryClient = useQueryClient();
  const dishesKey = ["dishes", restaurantId];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dishService.deleteDish(id),
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
              dishes: cat.dishes.filter((d) => d.id !== id),
            })),
          })),
        };
      });
      return { previous };
    },
    onSuccess: () => showToast("success", t.toastDeletedTitle, t.toastDeletedMessage),
    onError: (err, _variables, context) => {
      queryClient.setQueryData<AllDishesResponse>(dishesKey, context?.previous);
      showToast("error", t.toastDeleteFailedTitle, getErrorMessage(err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: dishesKey }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ payload }: { payload: UpdateDishRequest }) =>
      dishService.updateDish(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dishesKey });
      showToast("success", t.toastUpdatedTitle, t.toastUpdatedMessage);
    },
    onError: (err) => showToast("error", t.toastSaveFailedTitle, getErrorMessage(err)),
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
              dishes: cat.dishes.map((d) =>
                d.id === id ? { ...d, isVisible: !d.isVisible } : d,
              ),
            })),
          })),
        };
      });
      return { previous };
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData<AllDishesResponse>(dishesKey, context?.previous);
      showToast("error", t.toastUpdateFailedTitle, getErrorMessage(err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: dishesKey }),
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
              dishes: cat.dishes.map((d) =>
                d.id === id ? { ...d, isAvailable: !d.isAvailable } : d,
              ),
            })),
          })),
        };
      });
      return { previous };
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData<AllDishesResponse>(dishesKey, context?.previous);
      showToast("error", t.toastUpdateFailedTitle, getErrorMessage(err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: dishesKey }),
  });

  const handleToggleStatus    = () => toggleVisibleMutation.mutate(String(dish.id));
  const handleToggleAvailable = () => toggleAvailableMutation.mutate(String(dish.id));
  const handleDelete          = () => deleteMutation.mutate(String(dish.id));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleDescriptionChange = (lang: "en" | "fr" | "ar", value: string) => {
    const field =
      lang === "en" ? "englishDescription" : lang === "fr" ? "frenchDescription" : "arabicDescription";
    setForm((p) => ({ ...p, [field]: value }));
  };

  const isMissingEnglish = languages.showEnglish && (form.englishName?.trim().length ?? 0) < 1;
  const isMissingFrench  = languages.showFrench  && (form.frenchName?.trim().length ?? 0) < 1;
  const isMissingArabic  = languages.showArabic  && (form.arabicName?.trim().length ?? 0) < 1;
  const isMissingSizes   =
    !form.sizes ||
    form.sizes.length === 0 ||
    form.sizes.some((s) => !s.name?.trim() || !(s.price > 0));

  const handleSave = () => {
    if (isMissingEnglish) { setError(t.errorEnglishRequired); return; }
    if (isMissingFrench)  { setError(t.errorFrenchRequired);  return; }
    if (isMissingArabic)  { setError(t.errorArabicRequired);  return; }
    if (isMissingSizes)   { setSizesError(t.errorSizesRequired); return; }
    setError("");
    setSizesError("");
    updateMutation.mutate({ payload: form });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setForm(DishUItoUpdateDishRequest(dish));
    setError("");
    setSizesError("");
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
      <ToastContainer toasts={toasts} onClose={removeToast} />

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
              value={form.englishName ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, englishName: e.target.value }))}
              className={`${inputClass} ${error || isMissingEnglish ? "border-error" : ""}`}
            />
            {error && <span className="text-xs text-error text-center">{error}</span>}
          </div>
        ) : dish.english ? (
          <NamePopover label={dish.english} dir="ltr" />
        ) : (
          <span className={`text-sm px-2 py-1 rounded-lg text-warning ${missingClass}`}>{t.missing}</span>
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
        ) : dish.french ? (
          <NamePopover label={dish.french} dir="ltr" />
        ) : (
          <span className={`text-sm px-2 py-1 rounded-lg text-warning ${missingClass}`}>{t.missing}</span>
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
        ) : dish.arabic ? (
          <NamePopover label={dish.arabic} dir="rtl" />
        ) : (
          <span className={`text-sm px-2 py-1 rounded-lg text-warning ${missingClass}`}>{t.missing}</span>
        )}
      </TableCell>

      {/* Description */}
      <TableCell>
        <div className="flex justify-center">
          {isEditing ? (
            <MultilingualTextEditor
              englishText={form.englishDescription}
              frenchText={form.frenchDescription}
              arabicText={form.arabicDescription}
              onChange={handleDescriptionChange}
              languages={languages}
            />
          ) : (
            <MultilingualTextPopover
              englishText={dish.englishDescription}
              frenchText={dish.frenchDescription}
              arabicText={dish.arabicDescription}
              languages={languages}
            />
          )}
        </div>
      </TableCell>

      {/* Sizes */}
      <TableCell>
        <div className="flex justify-center">
          {isEditing ? (
            <SizesEditor
              sizes={form.sizes ?? []}
              onChange={(sizes) => setForm((p) => ({ ...p, sizes }))}
              devise={devise}
              addSizeLabel={t.addSize}
              sizeNamePlaceholder={t.sizeNamePlaceholder}
              error={sizesError}
            />
          ) : (
            <SizesPopover sizes={dish.sizes} devise={devise} />
          )}
        </div>
      </TableCell>

      {/* Supplements — independent of edit mode, toggles instantly */}
      <TableCell>
        <div className="flex justify-center">
          <DishSupplementsPopover
            dishId={String(dish.id)}
            attached={dish.supplements ?? []}
            emptyLabel={t.noSupplements}
            noneYetLabel={t.noSupplementsInCatalog}
          />
        </div>
      </TableCell>

      {/* Available */}
      <TableCell>
        <div className="flex justify-center">
          <Badge variant={dish.available === "available" ? "available" : "unavailable"} />
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        <div className="flex justify-center">
          <Badge variant={dish.status === "visible" ? "visible" : "hidden"} />
        </div>
      </TableCell>

      {/* Likes */}
      <TableCell>
        <div className="flex items-center justify-center gap-1">
          <Heart size={15} className={dish.likes > 0 ? "text-error fill-error" : "text-text-300"} />
          <span className="text-sm text-text-400">{dish.likes}</span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell>
        {isEditing ? (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleCancel}
              className="h-9 px-3 rounded-lg border border-beige-400 text-sm text-text-600 hover:bg-beige-200 transition-colors hover:cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="h-9 px-4 flex items-center gap-2 rounded-lg bg-primary-700 text-cream-500 text-sm font-medium hover:bg-primary-700/90 transition-colors hover:cursor-pointer"
            >
              <Save size={15} />
              {t.save}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={handleToggleStatus}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-beige-200 hover:text-primary-700 transition-colors hover:cursor-pointer"
              title={dish.status === "visible" ? "Hide dish" : "Show dish"}
            >
              {dish.status === "visible" ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
            <button
              onClick={handleToggleAvailable}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-beige-200 hover:text-primary-700 transition-colors hover:cursor-pointer"
              title={dish.available === "available" ? "Mark unavailable" : "Mark available"}
            >
              {dish.available === "available" ? <CircleCheck size={17} /> : <CircleX size={17} />}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-beige-200 hover:text-primary-700 transition-colors hover:cursor-pointer"
              title="Edit dish"
            >
              <Pencil size={17} />
            </button>
            <button
              onClick={handleDelete}
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