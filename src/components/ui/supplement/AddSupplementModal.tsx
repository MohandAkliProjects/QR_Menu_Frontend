import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";
import { X, Check } from "lucide-react";
import type { Language } from "../../../types/enums";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../../../hooks/useToast";
import { createSupplement } from "../../../services/supplement.service";
import type { CreateSupplementRequest } from "../../../types/api";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../i18n/useLanguage";
import ToastContainer from "../ToastContainer";
import { addSupplementModalText } from "../text/AddSupplementModal.text";
import { generalText } from "../../../pages/admin/text/General.text";

interface AddSupplementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  supportedLanguages: Language[];
}

function AddSupplementModal({
  isOpen,
  onClose,
  onSuccess,
  supportedLanguages,
}: AddSupplementModalProps) {
  const { language } = useLanguage();
  const t = addSupplementModalText[language];
  const gt = generalText[language];
  const { restaurantId, menuId } = useAuth();

  const showEnglish = supportedLanguages.includes("EN" as Language);
  const showFrench = supportedLanguages.includes("FR" as Language);
  const showArabic = supportedLanguages.includes("AR" as Language);

  const EMPTY: CreateSupplementRequest = {
    englishName: "",
    frenchName: "",
    arabicName: "",
    price: 0,
    available: true,
    visible: true,
    menuId: menuId ?? "",
  };

  const [form, setForm] = useState<CreateSupplementRequest>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateSupplementRequest, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof CreateSupplementRequest, string>> = {};
    if (showEnglish && !form.englishName?.trim()) newErrors.englishName = t.errorEnglishRequired;
    if (showFrench  && !form.frenchName?.trim())  newErrors.frenchName  = t.errorFrenchRequired;
    if (showArabic  && !form.arabicName?.trim())  newErrors.arabicName  = t.errorArabicRequired;
    if (!form.price || form.price <= 0)           newErrors.price       = t.errorPriceRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    createMutation.mutate({ ...form, menuId: menuId ?? "" });
  };

  const handleCancel = () => {
    setErrors({});
    setForm(EMPTY);
    onClose();
  };

  const { toasts, showToast, removeToast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateSupplementRequest) => createSupplement(payload),
    onSuccess: () => {
      setForm(EMPTY);
      onClose();
      onSuccess?.();
      showToast("success", t.toastSuccessTitle, t.toastSuccessMessage);
    },
    onError: () => showToast("error", gt.savingErrorTitle, gt.savingError),
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ["supplements", restaurantId, menuId] });
    },
  });

  const languageCount = [showEnglish, showFrench, showArabic].filter(Boolean).length;
  const gridCols =
    languageCount === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : languageCount === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1";

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Modal
        title={t.title}
        isOpen={isOpen}
        isPending={createMutation.isPending}
        onClose={onClose}
        footer={
          <div className="flex gap-4 w-full">
            <Button
              label={t.cancel}
              icon={X}
              onClick={handleCancel}
              disabled={createMutation.isPending}
              variant="secondary"
              fullWidth
            />
            <Button
              label={createMutation.isPending ? t.adding : t.confirm}
              icon={Check}
              disabled={createMutation.isPending}
              onClick={handleConfirm}
              fullWidth
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[65vh] pr-1">
          {languageCount > 0 && (
            <div className={`grid ${gridCols} gap-4`}>
              {showEnglish && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-text-600">
                    {t.labelEnglish} <span className="text-error">*</span>
                  </label>
                  <Input
                    value={form.englishName}
                    placeholder={t.placeholderEnglish}
                    onChange={(e) => setForm((p) => ({ ...p, englishName: e.target.value }))}
                    error={errors.englishName}
                  />
                  {errors.englishName && (
                    <span className="text-xs text-error">{errors.englishName}</span>
                  )}
                </div>
              )}
              {showFrench && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-text-600">
                    {t.labelFrench} <span className="text-error">*</span>
                  </label>
                  <Input
                    value={form.frenchName}
                    placeholder={t.placeholderFrench}
                    onChange={(e) => setForm((p) => ({ ...p, frenchName: e.target.value }))}
                    error={errors.frenchName}
                  />
                  {errors.frenchName && (
                    <span className="text-xs text-error">{errors.frenchName}</span>
                  )}
                </div>
              )}
              {showArabic && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-text-600">
                    {t.labelArabic} <span className="text-error">*</span>
                  </label>
                  <Input
                    value={form.arabicName}
                    placeholder={t.placeholderArabic}
                    onChange={(e) => setForm((p) => ({ ...p, arabicName: e.target.value }))}
                    error={errors.arabicName}
                  />
                  {errors.arabicName && (
                    <span className="text-xs text-error">{errors.arabicName}</span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-600">
              {t.priceLabel} <span className="text-error">*</span>
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.price || ""}
              placeholder="0.00"
              onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
              className={`
                w-full h-12 px-4 rounded-xl
                bg-card-bg border text-base text-text-800
                focus:outline-none transition-all duration-200
                shadow-(--shadow-card)
                ${errors.price ? "border-error" : "border-primary-200 focus:border-primary-500"}
              `}
            />
            {errors.price && <span className="text-xs text-error">{errors.price}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-600">{t.availabilityLabel}</label>
              <select
                value={form.available ? "available" : "unavailable"}
                onChange={(e) =>
                  setForm((p) => ({ ...p, available: e.target.value === "available" }))
                }
                className="
                  w-full h-12 px-4 rounded-xl
                  bg-card-bg border border-primary-200 text-base text-text-800
                  focus:outline-none focus:border-primary-500
                  shadow-(--shadow-card) transition-all duration-200
                "
              >
                <option value="available">{t.availableOption}</option>
                <option value="unavailable">{t.unavailableOption}</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-600">{t.visibilityLabel}</label>
              <select
                value={form.visible ? "visible" : "hidden"}
                onChange={(e) =>
                  setForm((p) => ({ ...p, visible: e.target.value === "visible" }))
                }
                className="
                  w-full h-12 px-4 rounded-xl
                  bg-card-bg border border-primary-200 text-base text-text-800
                  focus:outline-none focus:border-primary-500
                  shadow-(--shadow-card) transition-all duration-200
                "
              >
                <option value="visible">{t.visibleOption}</option>
                <option value="hidden">{t.hiddenOption}</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AddSupplementModal;