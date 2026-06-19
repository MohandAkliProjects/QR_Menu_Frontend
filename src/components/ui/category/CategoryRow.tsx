import { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Save,
  Upload,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import Badge from "../Badge";
import TableCell from "../table/TableCell";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../i18n/useLanguage";
import useToast from "../../../hooks/useToast";
import { getErrorMessage } from "../../../api/errors";
import * as categoryService from "../../../services/category.service";
import type { CategoriesPageData } from "../../../types/ui.ts";
import ToastContainer from "../../../components/ui/ToastContainer";
import type { UpdateCategoryRequest } from "../../../types/api";
import type { CategoryUI as Category } from "../../../types/ui.ts";
import { categoryRowText } from "../text/CategoryRow.text";

export interface LanguageConfig {
  showEnglish: boolean;
  showFrench: boolean;
  showArabic: boolean;
}

interface CategoryRowProps {
  category: Category;
  isLast?: boolean;
  isFirst?: boolean;
  languages: LanguageConfig;
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
              ${isFirst ? "-top-1.5 border-l border-t" : "-bottom-1.5 border-r border-b"}
            `}
          />
          <p dir={dir} className="text-sm text-text-700 whitespace-normal wrap-break-words">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}

function CategoryRow({ category, isLast, isFirst, languages }: CategoryRowProps) {
  const { menuId, restaurantId } = useAuth();
  const { language } = useLanguage();
  const t = categoryRowText[language];
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Category>(category);
  const [error, setError] = useState("");
  const iconInputRef = useRef<HTMLInputElement>(null);
  const { toasts, showToast, removeToast } = useToast();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setForm((prev) => ({ ...prev, icon: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const isMissingEnglish = languages.showEnglish && (form.english?.trim().length ?? 0) < 3;
  const isMissingFrench  = languages.showFrench  && (form.french?.trim().length ?? 0) < 3;
  const isMissingArabic  = languages.showArabic  && (form.arabic?.trim().length ?? 0) < 3;

  const handleSave = () => {
    if (languages.showEnglish && (form.english?.trim().length ?? 0) < 3) {
      setError(t.errorEnglishMin);
      return;
    }
    if (languages.showFrench && (form.french?.trim().length ?? 0) < 3) {
      setError(t.errorFrenchMin);
      return;
    }
    if (languages.showArabic && (form.arabic?.trim().length ?? 0) < 3) {
      setError(t.errorArabicMin);
      return;
    }
    const hasAny =
      (languages.showEnglish && (form.english?.trim().length ?? 0) >= 3) ||
      (languages.showFrench  && (form.french?.trim().length ?? 0) >= 3) ||
      (languages.showArabic  && (form.arabic?.trim().length ?? 0) >= 3);
    if (!hasAny) {
      setError(t.errorAtLeastOne);
      return;
    }
    setError("");
    updateMutation.mutate({
      data: {
        categoryId: String(category.id),
        visible: category.status === "visible",
        image: form.icon ?? undefined,
        arabicName: form.arabic,
        frenchName: form.french,
        englishName: form.english,
      },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setForm(category);
    setError("");
    setIsEditing(false);
  };

  const handleToggleStatus = () => toggleMutation.mutate(String(category.id));

  const categoriesKey = ["categories", restaurantId, menuId];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: categoriesKey });
      const previous = queryClient.getQueryData<CategoriesPageData>(categoriesKey);
      queryClient.setQueryData<CategoriesPageData>(categoriesKey, (old) => {
        if (!old) return old;
        return { ...old, categories: old.categories.filter((cat) => cat.id !== id) };
      });
      return { previous };
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData<CategoriesPageData>(categoriesKey, context?.previous);
      showToast("error", t.toastDeleteFailedTitle, getErrorMessage(err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoriesKey }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ data }: { data: UpdateCategoryRequest }) =>
      categoryService.updateCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      showToast("success", t.toastUpdatedTitle, t.toastUpdatedMessage);
    },
    onError: (err) => showToast("error", t.toastSaveFailedTitle, getErrorMessage(err)),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => categoryService.toggleCategoryVisible(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: categoriesKey });
      const previous = queryClient.getQueryData<CategoriesPageData>(categoriesKey);
      queryClient.setQueryData<CategoriesPageData>(categoriesKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          categories: old.categories.map((cat) =>
            cat.id === id ? { ...cat, isVisible: !cat.isVisible } : cat,
          ),
        };
      });
      return { previous };
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData<CategoriesPageData>(categoriesKey, context?.previous);
      showToast("error", t.toastSaveFailedTitle, getErrorMessage(err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoriesKey }),
  });

  const handleDelete = () => deleteMutation.mutate(String(category.id));

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
          <input
            ref={iconInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleIconChange}
          />
        )}
      </TableCell>

      {/* English */}
      <TableCell hidden={!languages.showEnglish}>
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <input
              value={form.english}
              onChange={(e) => setForm((p) => ({ ...p, english: e.target.value }))}
              className={`${inputClass} ${error || isMissingEnglish ? "border-error" : ""}`}
            />
            {error && <span className="text-xs text-error text-center">{error}</span>}
          </div>
        ) : category.english ? (
          <NamePopover label={category.english} dir="ltr" isFirst={isFirst} />
        ) : (
          <span className={`text-sm px-2 py-1 rounded-lg text-warning ${missingClass}`}>
            {t.missing}
          </span>
        )}
      </TableCell>

      {/* French */}
      <TableCell hidden={!languages.showFrench}>
        {isEditing ? (
          <input
            value={form.french ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, french: e.target.value }))}
            className={`${inputClass} ${isMissingFrench ? "border-warning" : ""}`}
          />
        ) : category.french ? (
          <NamePopover label={category.french} dir="ltr" isFirst={isFirst} />
        ) : (
          <span className={`text-sm px-2 py-1 rounded-lg text-warning ${missingClass}`}>
            {t.missing}
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
            className={`${inputClass} ${isMissingArabic ? "border-warning" : ""}`}
          />
        ) : category.arabic ? (
          <NamePopover label={category.arabic} dir="rtl" isFirst={isFirst} />
        ) : (
          <span className={`text-sm px-2 py-1 rounded-lg text-warning ${missingClass}`}>
            {t.missing}
          </span>
        )}
      </TableCell>

      {/* Status */}
      <TableCell>
        <div className="flex justify-center">
          <Badge variant={category.status === "visible" ? "visible" : "hidden"} />
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
            >
              {category.status === "visible" ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-beige-200 hover:text-primary-700 transition-colors hover:cursor-pointer"
            >
              <Pencil size={17} />
            </button>
            <button
              onClick={handleDelete}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-error hover:bg-error-bg transition-colors hover:cursor-pointer"
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