import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";
import CategoryImageUpload from "../category/CategoryImageUpload";
import { X, Check } from "lucide-react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import type { Devise, Language } from "../../../types/enums";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../../../hooks/useToast";
import { getErrorMessage } from "../../../api/errors";
import { createDish } from "../../../services/dish.service";
import type { CreateDishRequest } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import ToastContainer from "../../../components/ui/ToastContainer";
import { DEVISE_SYMBOLS } from "../../../lib/constants/devise";

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

const EMPTY: CreateDishRequest = {
  englishName: "",
  frenchName: "",
  arabicName: "",
  englishDescription: "",
  frenchDescription: "",
  arabicDescription: "",
  image: undefined,
  price: 0,
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
  const showEnglish = supportedLanguages.includes("EN" as Language);
  const showFrench = supportedLanguages.includes("FR" as Language);
  const showArabic = supportedLanguages.includes("AR" as Language);

  const [form, setForm] = useState<CreateDishRequest>(EMPTY);
  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateDishRequest, string>>
  >({});

  const descTabs = [
    showEnglish && {
      key: "en",
      label: "EN",
      field: "englishDescription" as const,
    },
    showFrench && {
      key: "fr",
      label: "FR",
      field: "frenchDescription" as const,
    },
    showArabic && {
      key: "ar",
      label: "AR",
      field: "arabicDescription" as const,
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    field: keyof CreateDishRequest;
  }[];

  const [activeDescTab, setActiveDescTab] = useState<string>(
    descTabs[0]?.key ?? "en",
  );

  const validate = () => {
    const newErrors: Partial<Record<keyof CreateDishRequest, string>> = {};
    if (showEnglish && !form.englishName?.trim())
      newErrors.englishName = "English name is required.";
    if (showFrench && !form.frenchName?.trim())
      newErrors.frenchName = "French name is required.";
    if (showArabic && !form.arabicName?.trim())
      newErrors.arabicName = "Arabic name is required.";
    if (!form.price || form.price <= 0)
      newErrors.price = "Price must be greater than 0.";
    if (!form.categoryId) newErrors.categoryId = "Please select a category.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    createMutation.mutate({ payload: form });
  };

  const handleCancel = () => {
    setErrors({});
    setForm(EMPTY);
    setPriceDisplay("");
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
      setPriceDisplay("");
      onClose();
      showToast(
        "success",
        "Dish Added",
        "New dish has been added successfully.",
      );
    },
    onError: (err) => showToast("error", "Save Failed", getErrorMessage(err)),
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ["dishes", restaurantId] });
    },
  });

  const languageCount = [showEnglish, showFrench, showArabic].filter(
    Boolean,
  ).length;
  const gridCols =
    languageCount === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : languageCount === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1";

  const activeTab = descTabs.find((t) => t.key === activeDescTab);
  const isActiveArabic = activeDescTab === "ar";

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Modal
        title="Add New Dish"
        isOpen={isOpen}
        isPending={createMutation.isPending}
        onClose={onClose}
        footer={
          <div className="flex gap-4 w-full">
            <Button
              label="Cancel"
              icon={X}
              onClick={handleCancel}
              disabled={createMutation.isPending}
              variant="secondary"
              fullWidth
            />
            <Button
              label={createMutation.isPending ? "Adding..." : "Confirm"}
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
            <CategoryImageUpload
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
                    English <span className="text-error">*</span>
                  </label>
                  <Input
                    value={form.englishName}
                    placeholder="Dish name"
                    onChange={(e) =>
                      setForm((p) => ({ ...p, englishName: e.target.value }))
                    }
                    error={errors.englishName}
                  />
                  {errors.englishName && (
                    <span className="text-xs text-error">
                      {errors.englishName}
                    </span>
                  )}
                </div>
              )}
              {showFrench && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-text-600">
                    Français <span className="text-error">*</span>
                  </label>
                  <Input
                    value={form.frenchName}
                    placeholder="Nom du plat"
                    onChange={(e) =>
                      setForm((p) => ({ ...p, frenchName: e.target.value }))
                    }
                    error={errors.frenchName}
                  />
                  {errors.frenchName && (
                    <span className="text-xs text-error">
                      {errors.frenchName}
                    </span>
                  )}
                </div>
              )}
              {showArabic && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-text-600">
                    العربية <span className="text-error">*</span>
                  </label>
                  <Input
                    value={form.arabicName}
                    placeholder="اسم الطبق"
                    onChange={(e) =>
                      setForm((p) => ({ ...p, arabicName: e.target.value }))
                    }
                    error={errors.arabicName}
                  />
                  {errors.arabicName && (
                    <span className="text-xs text-error">
                      {errors.arabicName}
                    </span>
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
                  Description
                  <span className="ml-1 text-xs text-text-400 font-normal">
                    (optional)
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
                  placeholder={
                    activeDescTab === "ar"
                      ? "أضف وصفًا لهذا الطبق (اختياري)"
                      : activeDescTab === "fr"
                        ? "Ajoutez une description pour ce plat (facultatif)"
                        : "Add a description for this dish (optional)"
                  }
                  dir={isActiveArabic ? "rtl" : "ltr"}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      [activeTab.field]: e.target.value,
                    }))
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

          {/* Price + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-600">
                Price <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-400">
                  {DEVISE_SYMBOLS[devise]}
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={priceDisplay}
                  placeholder="0.00"
                  onFocus={() => {
                    if (form.price === 0) setPriceDisplay("");
                  }}
                  onBlur={() => {
                    if (priceDisplay === "" || priceDisplay === "0") {
                      setPriceDisplay("");
                      setForm((p) => ({ ...p, price: 0 }));
                    }
                  }}
                  onChange={(e) => {
                    setPriceDisplay(e.target.value);
                    setForm((p) => ({ ...p, price: Number(e.target.value) }));
                    if (errors.price)
                      setErrors((prev) => ({ ...prev, price: undefined }));
                  }}
                  className={`
                    w-full h-12 pl-8 pr-4 rounded-xl
                    bg-card-bg border text-base text-text-800
                    focus:outline-none transition-all duration-200
                    shadow-(--shadow-card)
                    ${
                      errors.price
                        ? "border-error"
                        : "border-primary-200 focus:border-primary-500"
                    }
                  `}
                />
              </div>
              {errors.price && (
                <span className="text-xs text-error">{errors.price}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-600">
                Category <span className="text-error">*</span>
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
                <option value="">Select a category</option>
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
          </div>

          {/* Availability + Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-600">
                Availability
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
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-600">
                Visibility
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
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AddDishModal;
