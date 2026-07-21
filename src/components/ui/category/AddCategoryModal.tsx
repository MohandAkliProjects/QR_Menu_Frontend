import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";
import ImageUpload from "./ImageUpload";
import Notification from "../../shared/Notification";
import { X, Check } from "lucide-react";
import type { Language } from "../../../types/enums";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../../../hooks/useToast";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../i18n/useLanguage";
import * as categoryService from "../../../services/category.service";
import type { CreateCategoryRequest } from "../../../types";
import ToastContainer from "../../../components/ui/ToastContainer";
import { addCategoryModalText } from "../text/AddCategoryModal.text";
import { generalText } from "../../../pages/admin/text/General.text";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supportedLanguages: Language[];
}

const EMPTY: CreateCategoryRequest = {
  englishName: "",
  frenchName: "",
  arabicName: "",
  image: undefined,
  visible: true,
  menuId: "",
};


function AddCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  supportedLanguages,
}: AddCategoryModalProps) {
  const { language } = useLanguage();
  const t = addCategoryModalText[language];
  const gt = generalText[language];

  const [form, setForm] = useState<CreateCategoryRequest>(EMPTY);
  const [showValidationError, setShowValidationError] = useState(false);

  const showEnglish = supportedLanguages.includes("EN" as Language);
  const showFrench  = supportedLanguages.includes("FR" as Language);
  const showArabic  = supportedLanguages.includes("AR" as Language);

  const missingLanguages: string[] = [];
  if (showEnglish && !form.englishName?.trim()) missingLanguages.push(t.missingEnglish);
  if (showFrench  && !form.frenchName?.trim())  missingLanguages.push(t.missingFrench);
  if (showArabic  && !form.arabicName?.trim())  missingLanguages.push(t.missingArabic);

  const { menuId, restaurantId } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const queryClient = useQueryClient();
  const categoriesKey = ["categories", restaurantId, menuId];

  const handleConfirm = () => {
    if (missingLanguages.length > 0) {
      setShowValidationError(true);
      return;
    }
    if (!menuId) return;
    createMutation.mutate({ data: { ...form, menuId } });
  };

  const createMutation = useMutation({
    mutationFn: ({ data }: { data: CreateCategoryRequest }) => categoryService.createCategory(data),
    onSuccess: () => {
      onSuccess();
      onClose();
      setForm(EMPTY);
      showToast("success", t.toastSuccessTitle, t.toastSuccessMessage); 
    },
    onError: () => showToast("error", gt.savingErrorTitle, gt.savingError),
    onSettled() {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
    },
  });

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Modal
        title={t.title}
        isOpen={isOpen}
        onClose={onClose}
        isPending={createMutation.isPending}
        footer={
          <div className="flex gap-4 w-full">
            <Button
              label={t.cancel}
              icon={X}
              onClick={onClose}
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
        <div />

        {missingLanguages.length > 0 && (
          <Notification
            variant={showValidationError ? "error" : "warning"}
            title={t.missingTranslationsTitle}
            message={`${t.missingTranslationsMessage} ${missingLanguages.join(", ")}`}
          />
        )}

        <div className="flex justify-center w-full">
          <div className="w-full max-w-105">
            <ImageUpload
              preview={form.image ?? null}
              onChange={(_, preview) =>
                setForm((prev) => ({ ...prev, image: preview }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {showEnglish && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-600">
                {t.labelEnglish}
              </label>
              <Input
                value={form.englishName}
                placeholder={t.placeholderName}
                onChange={(e) => {
                  setShowValidationError(false);
                  setForm((prev) => ({ ...prev, englishName: e.target.value }));
                }}
              />
            </div>
          )}
          {showFrench && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-600">
                {t.labelFrench}
              </label>
              <Input
                value={form.frenchName ?? ""}
                placeholder={t.placeholderName}
                onChange={(e) => {
                  setShowValidationError(false);
                  setForm((prev) => ({ ...prev, frenchName: e.target.value }));
                }}
              />
            </div>
          )}
          {showArabic && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-600">
                {t.labelArabic}
              </label>
              <Input
                value={form.arabicName ?? ""}
                placeholder={t.placeholderName}
                onChange={(e) => {
                  setShowValidationError(false);
                  setForm((prev) => ({ ...prev, arabicName: e.target.value }));
                }}
              />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default AddCategoryModal;