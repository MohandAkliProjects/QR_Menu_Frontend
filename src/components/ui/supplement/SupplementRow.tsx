import { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Save,
  ChevronDown,
} from "lucide-react";
import { CircleCheck, CircleX } from "lucide-react";
import Badge from "../Badge";
import TableCell from "../table/TableCell";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../i18n/useLanguage";
import useToast from "../../../hooks/useToast";
import { getErrorMessage } from "../../../api/errors";
import * as supplementService from "../../../services/supplement.service";
import ToastContainer from "../../../components/ui/ToastContainer";
import type { UpdateSupplementRequest, SupplementResponse } from "../../../types/api";
import type { SupplementUI as Supplement } from "../../../types/ui";
import type { LanguageConfig } from "../category/CategoryRow";
import { supplementRowText } from "../text/SupplementRow.text";

interface SupplementsCache {
  supplements: SupplementResponse[];
  supportedLanguages: unknown;
}

interface SupplementRowProps {
  supplement: Supplement;
  isLast?: boolean;
  isFirst?: boolean;
  languages: LanguageConfig;
}

function SupplementUItoUpdateRequest(supplement: Supplement): UpdateSupplementRequest {
  return {
    supplementId: String(supplement.id),
    englishName: supplement.english,
    frenchName: supplement.french,
    arabicName: supplement.arabic,
    price: supplement.price,
    available: supplement.available === "available",
    visible: supplement.status === "visible",
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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

function SupplementRow({ supplement, isLast, isFirst, languages }: SupplementRowProps) {
  const { language } = useLanguage();
  const t = supplementRowText[language];
  const { restaurantId, menuId } = useAuth();
  const queryClient = useQueryClient();
  const supplementsKey = ["supplements", restaurantId, menuId];

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateSupplementRequest>(
    SupplementUItoUpdateRequest(supplement),
  );
  const [error, setError] = useState("");
  const { toasts, showToast, removeToast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => supplementService.deleteSupplement(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: supplementsKey });
      const previous = queryClient.getQueryData<SupplementsCache>(supplementsKey);
      queryClient.setQueryData<SupplementsCache>(supplementsKey, (old) => {
        if (!old) return old;
        return { ...old, supplements: old.supplements.filter((s) => s.id !== id) };
      });
      return { previous };
    },
    onSuccess: () => showToast("success", t.toastDeletedTitle, t.toastDeletedMessage),
    onError: (err, _variables, context) => {
      queryClient.setQueryData<SupplementsCache>(supplementsKey, context?.previous);
      showToast("error", t.toastDeleteFailedTitle, getErrorMessage(err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: supplementsKey }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSupplementRequest) => supplementService.updateSupplement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplementsKey });
      showToast("success", t.toastUpdatedTitle, t.toastUpdatedMessage);
    },
    onError: (err) => showToast("error", t.toastSaveFailedTitle, getErrorMessage(err)),
  });

 
 const toggleVisibleMutation = useMutation({
    mutationFn: (id: string) => supplementService.toggleSupplementVisible(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: supplementsKey });
      const previous = queryClient.getQueryData<SupplementsCache>(supplementsKey);
      queryClient.setQueryData<SupplementsCache>(supplementsKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          supplements: old.supplements.map((s) => {
            if (s.id !== id) return s;
            const next = !(s.isVisible ?? s.visible);
            return { ...s, isVisible: next, visible: next };
          }),
        };
      });
      return { previous };
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData<SupplementsCache>(supplementsKey, context?.previous);
      showToast("error", t.toastUpdateFailedTitle, getErrorMessage(err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: supplementsKey }),
  });

  const toggleAvailableMutation = useMutation({
    mutationFn: (id: string) => supplementService.toggleSupplementAvailable(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: supplementsKey });
      const previous = queryClient.getQueryData<SupplementsCache>(supplementsKey);
      queryClient.setQueryData<SupplementsCache>(supplementsKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          supplements: old.supplements.map((s) => {
            if (s.id !== id) return s;
            const next = !(s.isAvailable ?? s.available);
            return { ...s, isAvailable: next, available: next };
          }),
        };
      });
      return { previous };
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData<SupplementsCache>(supplementsKey, context?.previous);
      showToast("error", t.toastUpdateFailedTitle, getErrorMessage(err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: supplementsKey }),
  });

  const handleToggleStatus    = () => toggleVisibleMutation.mutate(String(supplement.id));
  const handleToggleAvailable = () => toggleAvailableMutation.mutate(String(supplement.id));
  const handleDelete          = () => deleteMutation.mutate(String(supplement.id));

  const isMissingEnglish = languages.showEnglish && (form.englishName?.trim().length ?? 0) < 1;
  const isMissingFrench  = languages.showFrench  && (form.frenchName?.trim().length ?? 0) < 1;
  const isMissingArabic  = languages.showArabic  && (form.arabicName?.trim().length ?? 0) < 1;
  const isMissingPrice   = !(form.price > 0);

  const handleSave = () => {
    if (isMissingEnglish) { setError(t.errorEnglishRequired); return; }
    if (isMissingFrench)  { setError(t.errorFrenchRequired);  return; }
    if (isMissingArabic)  { setError(t.errorArabicRequired);  return; }
    if (isMissingPrice)   { setError(t.errorPriceRequired);   return; }
    setError("");
    updateMutation.mutate(form);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setForm(SupplementUItoUpdateRequest(supplement));
    setError("");
    setIsEditing(false);
  };

  const missingClass = "border-warning bg-warning/10";
  const inputClass =
    "w-full h-9 px-3 rounded-lg border border-beige-400 text-sm text-center text-dark-700 bg-cream-200 focus:outline-none focus:border-primary-500";

  return (
    <tr
      className={`
        bg-card-bg transition-colors hover:bg-beige-50
        ${!isLast ? "border-b border-beige-300" : ""}
      `}
    >
      <ToastContainer toasts={toasts} onClose={removeToast} />

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
        ) : supplement.english ? (
          <NamePopover label={supplement.english} dir="ltr" isFirst={isFirst} />
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
        ) : supplement.french ? (
          <NamePopover label={supplement.french} dir="ltr" isFirst={isFirst} />
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
        ) : supplement.arabic ? (
          <NamePopover label={supplement.arabic} dir="rtl" isFirst={isFirst} />
        ) : (
          <span className={`text-sm px-2 py-1 rounded-lg text-warning ${missingClass}`}>{t.missing}</span>
        )}
      </TableCell>

      {/* Price */}
      <TableCell>
        {isEditing ? (
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
            className={`${inputClass} ${isMissingPrice ? "border-error" : ""}`}
          />
        ) : (
          <span className="text-sm text-text-600">{supplement.price}</span>
        )}
      </TableCell>

      {/* Available */}
      <TableCell>
        <div className="flex justify-center">
          <Badge variant={supplement.available === "available" ? "available" : "unavailable"} />
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        <div className="flex justify-center">
          <Badge variant={supplement.status === "visible" ? "visible" : "hidden"} />
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
              title={supplement.status === "visible" ? "Hide supplement" : "Show supplement"}
            >
              {supplement.status === "visible" ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
            <button
              onClick={handleToggleAvailable}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-beige-200 hover:text-primary-700 transition-colors hover:cursor-pointer"
              title={supplement.available === "available" ? "Mark unavailable" : "Mark available"}
            >
              {supplement.available === "available" ? <CircleCheck size={17} /> : <CircleX size={17} />}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-beige-200 hover:text-primary-700 transition-colors hover:cursor-pointer"
              title="Edit supplement"
            >
              <Pencil size={17} />
            </button>
            <button
              onClick={handleDelete}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-error/10 hover:text-error transition-colors hover:cursor-pointer"
              title="Delete supplement"
            >
              <Trash2 size={17} />
            </button>
          </div>
        )}
      </TableCell>
    </tr>
  );
}

export default SupplementRow;