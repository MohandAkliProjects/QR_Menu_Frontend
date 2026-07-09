import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";
import ImageUpload from "../category/ImageUpload";
import { X, Check } from "lucide-react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import type { Devise, Language } from "../../../types/enums";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../../../hooks/useToast";
import { createDish } from "../../../services/dish.service";
import type { CreateDishRequest } from "../../../types";
import type { DishSize } from "../../../types/api";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../i18n/useLanguage";
import ToastContainer from "../ToastContainer";
import { DEVISE_SYMBOLS } from "../../../lib/constants/devise";
import { addDishModalText } from "../text/AddDishModal.text";
import { generalText } from "../../../pages/admin/text/General.text";

interface Category {
  id: UniqueIdentifier;
  label: string;
}

interface AddDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  supportedLanguages: Language[];
  devise: Devise;
}

const DEFAULT_SIZE_NAME = "Regular";

const EMPTY: CreateDishRequest = {
  englishName: "",
  frenchName: "",
  arabicName: "",
  englishDescription: "",
  frenchDescription: "",
  arabicDescription: "",
  image: undefined,
  sizes: [{ name: "", price: 0 }],
  available: true,
  visible: true,
  categoryId: "",
};

function AddDishModal({
  isOpen,
  onClose,
  categories,
  supportedLanguages,
  devise,
}: AddDishModalProps) {
  const { language } = useLanguage();
  const t = addDishModalText[language];
  const gt = generalText[language];

  const showEnglish = supportedLanguages.includes("EN" as Language);
  const showFrench = supportedLanguages.includes("FR" as Language);
  const showArabic = supportedLanguages.includes("AR" as Language);

  const [form, setForm] = useState<CreateDishRequest>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateDishRequest, string>>>({});

  const descTabs = [
    showEnglish && { key: "en", label: "EN", field: "englishDescription" as const },
    showFrench  && { key: "fr", label: "FR", field: "frenchDescription" as const },
    showArabic  && { key: "ar", label: "AR", field: "arabicDescription" as const },
  ].filter(Boolean) as { key: string; label: string; field: keyof CreateDishRequest }[];

  const [activeDescTab, setActiveDescTab] = useState<string>(
    descTabs[0]?.key ?? "en",
  );

  const hasSingleSize = form.sizes.length === 1;

  const updateSize = (index: number, patch: Partial<DishSize>) => {
    setForm((p) => ({
      ...p,
      sizes: p.sizes.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
    if (errors.sizes) setErrors((prev) => ({ ...prev, sizes: undefined }));
  };

  const addSize = () => {
    setForm((p) => ({ ...p, sizes: [...p.sizes, { name: "", price: 0 }] }));
  };

  const removeSize = (index: number) => {
    setForm((p) => ({ ...p, sizes: p.sizes.filter((_, i) => i !== index) }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof CreateDishRequest, string>> = {};
    if (showEnglish && !form.englishName?.trim()) newErrors.englishName = t.errorEnglishRequired;
    if (showFrench  && !form.frenchName?.trim())  newErrors.frenchName  = t.errorFrenchRequired;
    if (showArabic  && !form.arabicName?.trim())  newErrors.arabicName  = t.errorArabicRequired;

    const invalidSizes =
      !form.sizes ||
      form.sizes.length === 0 ||
      form.sizes.some((s) => !(s.price > 0)) ||
      (form.sizes.length > 1 && form.sizes.some((s) => !s.name.trim()));
    if (invalidSizes) {
      newErrors.sizes = hasSingleSize ? t.errorPriceRequired : t.errorSizesRequired;
    }

    if (!form.categoryId) newErrors.categoryId = t.errorCategoryRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;

    const sizesForSubmit: DishSize[] = form.sizes.map((s) => ({
      ...s,
      name: s.name.trim() || DEFAULT_SIZE_NAME,
    }));

    createMutation.mutate({ payload: { ...form, sizes: sizesForSubmit } });
  };

  const handleCancel = () => {
    setErrors({});
    setForm(EMPTY);
    onClose();
  };

  const { toasts, showToast, removeToast } = useToast();
  const queryClient = useQueryClient();
  const { restaurantId } = useAuth();

  const createMutation = useMutation({
    mutationFn: ({ payload }: { payload: CreateDishRequest }) => 
      createDish(payload),
    onSuccess: () => {
      setForm(EMPTY);
      onClose();
      showToast("success", t.toastSuccessTitle, t.toastSuccessMessage);
    },
    onError: () => showToast("error", gt.savingErrorTitle, gt.savingError),
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ["dishes", restaurantId] });
    },
  });

  const languageCount = [showEnglish, showFrench, showArabic].filter(Boolean).length;
  const gridCols =
    languageCount === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : languageCount === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1";

  const activeTab = descTabs.find((tab) => tab.key === activeDescTab);
  const isActiveArabic = activeDescTab === "ar";

  const descPlaceholder =
    isActiveArabic
      ? t.descriptionPlaceholderAr
      : activeDescTab === "fr"
        ? t.descriptionPlaceholderFr
        : t.descriptionPlaceholderEn;

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
          {/* Image Upload */}
          <div className="w-full">
            <ImageUpload
              preview={form.image ?? null}
              onChange={(_, preview) =>
                setForm((prev) => ({ ...prev, image: preview }))
              }
            />
          </div>

          {/* Name Fields */}
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
                    onChange={(e) =>
                      setForm((p) => ({ ...p, englishName: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setForm((p) => ({ ...p, frenchName: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setForm((p) => ({ ...p, arabicName: e.target.value }))
                    }
                    error={errors.arabicName}
                  />
                  {errors.arabicName && (
                    <span className="text-xs text-error">{errors.arabicName}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {descTabs.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-600">
                  {t.descriptionLabel}
                  <span className="ml-1 text-xs text-text-400 font-normal">
                    {t.descriptionOptional}
                  </span>
                </label>
                {descTabs.length > 1 && (
                  <div className="flex rounded-lg border border-primary-200 overflow-hidden">
                    {descTabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveDescTab(tab.key)}
                        className={`
                          px-3 py-1 text-xs font-medium transition-colors
                          ${
                            activeDescTab === tab.key
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
              </div>

              {activeTab && (
                <textarea
                  key={activeTab.key}
                  value={(form[activeTab.field] as string) ?? ""}
                  placeholder={descPlaceholder}
                  dir={isActiveArabic ? "rtl" : "ltr"}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [activeTab.field]: e.target.value }))
                  }
                  rows={2}
                  className="
                    w-full px-4 py-3 rounded-xl
                    bg-card-bg border border-primary-200
                    text-base text-text-800
                    focus:outline-none focus:border-primary-500
                    shadow-(--shadow-card)
                    transition-all duration-200
                    resize-none
                  "
                />
              )}
            </div>
          )}

          {/* Sizes */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-600">
              {t.sizesLabel} <span className="text-error">*</span>
            </label>
            <div className="flex flex-col gap-2">
              {form.sizes.map((size, index) => (
                <div key={index} className="flex items-center gap-2">
                 
                  {!hasSingleSize && (
                    <input
                      value={size.name}
                      placeholder={t.sizeNamePlaceholder}
                      onChange={(e) => updateSize(index, { name: e.target.value })}
                      className={`
                        flex-1 h-11 px-3 rounded-xl
                        bg-card-bg border text-sm text-text-800
                        focus:outline-none transition-all duration-200
                        shadow-(--shadow-card)
                        ${
                          errors.sizes && !size.name.trim()
                            ? "border-error"
                            : "border-primary-200 focus:border-primary-500"
                        }
                      `}
                    />
                  )}
                  <div className={`relative shrink-0 ${hasSingleSize ? "flex-1" : "w-28"}`}>
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-400">
                      {DEVISE_SYMBOLS[devise]}
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={size.price || ""}
                      placeholder="0.00"
                      onChange={(e) => updateSize(index, { price: Number(e.target.value) })}
                      className={`
                        w-full h-11 pl-7 pr-2 rounded-xl
                        bg-card-bg border text-sm text-text-800
                        focus:outline-none transition-all duration-200
                        shadow-(--shadow-card)
                        ${
                          errors.sizes && !(size.price > 0)
                            ? "border-error"
                            : "border-primary-200 focus:border-primary-500"
                        }
                      `}
                    />
                  </div>
                  {form.sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-text-400 hover:bg-error/10 hover:text-error transition-colors shrink-0"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSize}
              className="self-start text-sm text-primary-700 font-medium hover:underline"
            >
              + {t.addSizeLabel}
            </button>
            {hasSingleSize && (
              <span className="text-xs text-text-400">{t.singleSizeHint}</span>
            )}
            {errors.sizes && (
              <span className="text-xs text-error">{errors.sizes}</span>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-600">
              {t.categoryLabel} <span className="text-error">*</span>
            </label>
            <select
              value={String(form.categoryId)}
              onChange={(e) =>
                setForm((p) => ({ ...p, categoryId: e.target.value }))
              }
              className={`
                w-full h-12 px-4 rounded-xl
                bg-card-bg border text-base text-text-800
                focus:outline-none transition-all duration-200
                shadow-(--shadow-card)
                ${
                  errors.categoryId
                    ? "border-error"
                    : "border-primary-200 focus:border-primary-500"
                }
              `}
            >
              <option value="">{t.categoryPlaceholder}</option>
              {categories.map((cat) => (
                <option key={String(cat.id)} value={String(cat.id)}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="text-xs text-error">{errors.categoryId}</span>
            )}
          </div>

          {/* Availability + Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-600">
                {t.availabilityLabel}
              </label>
              <select
                value={form.available ? "available" : "unavailable"}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    available: e.target.value === "available",
                  }))
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
              <label className="text-sm font-medium text-text-600">
                {t.visibilityLabel}
              </label>
              <select
                value={form.visible ? "visible" : "hidden"}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    visible: e.target.value === "visible",
                  }))
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

export default AddDishModal;