import { useState, useRef, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Save,
  Upload,
  Image as ImageIcon,
  Heart,
  Eye,
  EyeOff,
  ChevronDown,
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
import ToastContainer from "../../../components/ui/ToastContainer";
import type { UpdateDishRequest } from "../../../types/api";
import type { Devise } from "../../../types";
import { DEVISE_SYMBOLS } from "../../../lib/constants/devise";

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
    price: dish.price,
    dishId: String(dish.id),
    image: dish.image ?? undefined,
  };
}

interface NamePopoverProps {
  label: string;
  dir?: "ltr" | "rtl";
  isFirst?: boolean;
}

function NamePopover({ label, dir = "ltr", isFirst }: NamePopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isTruncated = label.length > 14;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!isTruncated)
    return <span className="text-sm text-text-600">{label}</span>;

  return (
    <div ref={ref} className="relative flex justify-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-text-600 hover:bg-beige-100 transition-colors max-w-30"
      >
        <span className="truncate">{label}</span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-text-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`
            absolute z-50 left-1/2 -translate-x-1/2
            ${isFirst ? "top-full mt-2" : "bottom-full mb-2"}
            w-max max-w-50 rounded-xl border border-beige-300
            bg-card-bg shadow-lg px-3 py-2
          `}
        >
          <div
            className={`
              absolute left-1/2 -translate-x-1/2
              w-3 h-3 rotate-45 bg-card-bg border-beige-300
              ${
                isFirst
                  ? "-top-1.5 border-l border-t"
                  : "-bottom-1.5 border-r border-b"
              }
            `}
          />
          <p
            dir={dir}
            className="text-sm text-text-700 whitespace-normal wrap-break-words"
          >
            {label}
          </p>
        </div>
      )}
    </div>
  );
}

interface DescriptionPopoverProps {
  dish: Dish;
  languages: LanguageConfig;
  isFirst?: boolean;
}

function DescriptionPopover({
  dish,
  languages,
  isFirst,
}: DescriptionPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hasAny =
    dish.englishDescription || dish.frenchDescription || dish.arabicDescription;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!hasAny) {
    return <span className="text-sm text-text-300 select-none">—</span>;
  }

  const entries = [
    languages.showEnglish &&
      dish.englishDescription && {
        label: "EN",
        text: dish.englishDescription,
        dir: "ltr" as const,
      },
    languages.showFrench &&
      dish.frenchDescription && {
        label: "FR",
        text: dish.frenchDescription,
        dir: "ltr" as const,
      },
    languages.showArabic &&
      dish.arabicDescription && {
        label: "AR",
        text: dish.arabicDescription,
        dir: "rtl" as const,
      },
  ].filter(Boolean) as { label: string; text: string; dir: "ltr" | "rtl" }[];

  return (
    <div ref={ref} className="relative flex justify-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-text-600 hover:bg-beige-100 transition-colors max-w-35"
        title="Click to see descriptions"
      >
        <span className="truncate">
          {dish.englishDescription ||
            dish.frenchDescription ||
            dish.arabicDescription}
        </span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-text-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`
            absolute z-50 left-1/2 -translate-x-1/2
            ${isFirst ? "top-full mt-2" : "bottom-full mb-2"}
            w-64 rounded-xl border border-beige-300
            bg-card-bg shadow-lg p-3
            flex flex-col gap-3
          `}
        >
          <div
            className={`
              absolute left-1/2 -translate-x-1/2
              w-3 h-3 rotate-45 bg-card-bg border-beige-300
              ${
                isFirst
                  ? "-top-1.5 border-l border-t"
                  : "-bottom-1.5 border-r border-b"
              }
            `}
          />
          {entries.map((entry) => (
            <div key={entry.label} className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold tracking-widest uppercase text-text-400">
                {entry.label}
              </span>
              <p
                dir={entry.dir}
                className="text-sm text-text-700 leading-relaxed wrap-break-words"
              >
                {entry.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface DescriptionEditProps {
  form: UpdateDishRequest;
  setForm: React.Dispatch<React.SetStateAction<UpdateDishRequest>>;
  languages: LanguageConfig;
}

function DescriptionEdit({ form, setForm, languages }: DescriptionEditProps) {
  const tabs = [
    languages.showEnglish && {
      key: "en",
      label: "EN",
      field: "englishDescription" as const,
      dir: "ltr" as const,
      placeholder: "Description…",
    },
    languages.showFrench && {
      key: "fr",
      label: "FR",
      field: "frenchDescription" as const,
      dir: "ltr" as const,
      placeholder: "Description…",
    },
    languages.showArabic && {
      key: "ar",
      label: "AR",
      field: "arabicDescription" as const,
      dir: "rtl" as const,
      placeholder: "وصف…",
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    field: keyof UpdateDishRequest;
    dir: "ltr" | "rtl";
    placeholder: string;
  }[];

  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "en");
  const active = tabs.find((t) => t.key === activeTab);

  if (!tabs.length) return null;

  return (
    <div className="flex flex-col gap-1 w-full">
      {tabs.length > 1 && (
        <div className="flex rounded-md border border-beige-300 overflow-hidden self-start">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-2 py-0.5 text-[10px] font-semibold transition-colors
                ${
                  activeTab === tab.key
                    ? "bg-primary-700 text-cream-500"
                    : "bg-card-bg text-text-500 hover:bg-beige-100"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {active && (
        <textarea
          key={active.key}
          value={(form[active.field] as string) ?? ""}
          placeholder={active.placeholder}
          dir={active.dir}
          onChange={(e) =>
            setForm((p) => ({ ...p, [active.field]: e.target.value }))
          }
          rows={2}
          className="
            w-full px-3 py-2 rounded-lg border border-beige-400
            text-sm text-dark-700 bg-cream-200
            focus:outline-none focus:border-primary-500
            resize-none overflow-y-auto max-h-20
          "
        />
      )}
    </div>
  );
}

function DishRow({ dish, devise, isLast, isFirst, languages }: DishRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateDishRequest>(
    DishUItoUpdateDishRequest(dish),
  );
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

  const { toasts, showToast, removeToast } = useToast();
  const { restaurantId } = useAuth();
  const queryClient = useQueryClient();
  const dishesKey = ["dishes", restaurantId];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dishService.deleteDish(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["dishes", restaurantId] });
      const previous = queryClient.getQueryData<AllDishesResponse>([
        "dishes",
        restaurantId,
      ]);

      queryClient.setQueryData<AllDishesResponse>(
        ["dishes", restaurantId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            menus: old.menus.map((menu) => ({
              ...menu,
              categories: menu.categories.map((cat) => ({
                ...cat,
                dishes: cat.dishes.filter((dish) => dish.id !== id),
              })),
            })),
          };
        },
      );

      return { previous };
    },

    onSuccess: () => {
      showToast(
        "success",
        "Dish Deleted",
        "Dish has been deleted successfully.",
      );
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData<AllDishesResponse>(
        ["dishes", restaurantId],
        context?.previous,
      );
      showToast("error", "Delete Failed", getErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes", restaurantId] });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(String(dish.id));
  };

  const updateMutation = useMutation({
    mutationFn: ({ payload }: { payload: UpdateDishRequest }) =>
      dishService.updateDish(payload),
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
      showToast("error", "Update Failed", getErrorMessage(err));
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
      showToast("error", "Update Failed", getErrorMessage(err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: dishesKey }),
  });

  const handleToggleStatus = () =>
    toggleVisibleMutation.mutate(String(dish.id));
  const handleToggleAvailable = () =>
    toggleAvailableMutation.mutate(String(dish.id));

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
    if (isMissingEnglish) {
      setError("English name is required.");
      return;
    }
    if (isMissingFrench) {
      setError("French name is required.");
      return;
    }
    if (isMissingArabic) {
      setError("Arabic name is required.");
      return;
    }
    setError("");
    updateMutation.mutate({ payload: form });
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
        ) : dish.english ? (
          <NamePopover label={dish.english} dir="ltr" isFirst={isFirst} />
        ) : (
          <span
            className={`text-sm px-2 py-1 rounded-lg text-warning ${missingClass}`}
          >
            Missing
          </span>
        )}
      </TableCell>

      {/* French */}
      <TableCell hidden={!languages.showFrench}>
        {isEditing ? (
          <input
            value={form.frenchName ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, frenchName: e.target.value }))
            }
            className={`${inputClass} ${isMissingFrench ? "border-warning" : ""}`}
          />
        ) : dish.french ? (
          <NamePopover label={dish.french} dir="ltr" isFirst={isFirst} />
        ) : (
          <span
            className={`text-sm px-2 py-1 rounded-lg text-warning ${missingClass}`}
          >
            Missing
          </span>
        )}
      </TableCell>

      {/* Arabic */}
      <TableCell hidden={!languages.showArabic}>
        {isEditing ? (
          <input
            value={form.arabicName ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, arabicName: e.target.value }))
            }
            dir="rtl"
            className={`${inputClass} ${isMissingArabic ? "border-warning" : ""}`}
          />
        ) : dish.arabic ? (
          <NamePopover label={dish.arabic} dir="rtl" isFirst={isFirst} />
        ) : (
          <span
            className={`text-sm px-2 py-1 rounded-lg text-warning ${missingClass}`}
          >
            Missing
          </span>
        )}
      </TableCell>

      {/* Description */}
      <TableCell>
        <div className="flex justify-center">
          {isEditing ? (
            <DescriptionEdit
              form={form}
              setForm={setForm}
              languages={languages}
            />
          ) : (
            <DescriptionPopover
              dish={dish}
              languages={languages}
              isFirst={isFirst}
            />
          )}
        </div>
      </TableCell>

      {/* Price */}
      <TableCell>
        {isEditing ? (
          <div className="flex items-center gap-1 justify-center">
            <span className="text-sm text-text-400">
              {DEVISE_SYMBOLS[devise]}
            </span>{" "}
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
          <span className="text-sm text-text-600">
            {DEVISE_SYMBOLS[devise]} {dish.price}
          </span>
        )}
      </TableCell>

      {/* Available */}
      {/* Available */}
      <TableCell>
        <div className="flex justify-center">
          <Badge
            variant={
              dish.available === "available" ? "available" : "unavailable"
            }
          />
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
              className="h-9 px-3 rounded-lg border border-beige-400 text-sm text-text-600 hover:bg-beige-200 transition-colors hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="h-9 px-4 flex items-center gap-2 rounded-lg bg-primary-700 text-cream-500 text-sm font-medium hover:bg-primary-700/90 transition-colors hover:cursor-pointer"
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
                <CircleCheck size={17} />
              ) : (
                <CircleX size={17} />
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
