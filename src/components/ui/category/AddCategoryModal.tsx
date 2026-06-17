import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";
import CategoryImageUpload from "./CategoryImageUpload";
import Notification from "../../shared/Notification";
import { Trash2, Check } from "lucide-react";
import type { Language } from "../../../types/enums";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useToast from "../../../hooks/useToast";
import { useAuth } from "../../../context/AuthContext";
import { getErrorMessage } from "../../../api/errors";
import * as categoryService from "../../../services/category.service";
import type { CreateCategoryRequest } from "../../../types";
import ToastContainer from "../../../components/ui/ToastContainer";

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
  menuId: ""
};

function AddCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  supportedLanguages
}: AddCategoryModalProps) {
  const [form, setForm] = useState<CreateCategoryRequest>(EMPTY);
  const [showValidationError, setShowValidationError] = useState(false);

  const showEnglish =
    supportedLanguages.includes("EN" as Language);

  const showFrench =
    supportedLanguages.includes("FR" as Language);

  const showArabic =
    supportedLanguages.includes("AR" as Language);

  const missingLanguages: string[] = [];

  if (showEnglish  && !form.englishName?.trim()) {
      missingLanguages.push("English");
  }

  if (showFrench && !form.frenchName?.trim()) {
      missingLanguages.push("French");
  }

  if (showArabic && !form.arabicName?.trim()) {
      missingLanguages.push("Arabic");
  }

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
  createMutation.mutate({ data: { ...form, menuId: menuId } });
};

const createMutation = useMutation({
    mutationFn: ({
      data
    }: {
      data: CreateCategoryRequest;
    }) => categoryService.createCategory(data),
    onSuccess: () => {
      onSuccess();
      onClose();
      setForm(EMPTY);
      showToast(
        "success",
        "Category Added",
        "New category has been added successfully.",
      );
    },
    onError: (err) => showToast("error", "Save Failed", getErrorMessage(err)),
    onSettled() {
      queryClient.invalidateQueries({queryKey: categoriesKey});
    },
  });

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Modal
      title={"Add New Category"}
      isOpen={isOpen}
      onClose={onClose}
      isPending={createMutation.isPending}
      footer={
        <div className="flex gap-4 w-full">
          <Button
            label="Cancel"
            icon={Trash2}
            onClick={onClose}
            fullWidth
            className="bg-transparent! border! border-error! text-error! hover:bg-error/10!"
          />

          <Button
            label="Confirm"
            icon={Check}
            onClick={handleConfirm}
            fullWidth
          />
        </div>
      }
    >

      <div>
        
      </div>
      {missingLanguages.length > 0 && (
        <Notification
          variant={
            showValidationError
              ? "error"
              : "warning"
          }
          title="Missing Translations"
          message={`Please fill in: ${missingLanguages.join(
            ", "
          )}`}
        />
      )}

      <div className="flex justify-center w-full">
        <div className="w-full max-w-105">
          <CategoryImageUpload
            preview={form.image ?? null}
            onChange={(_, preview) =>
              setForm((prev) => ({
                ...prev,
                image: preview
              }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {showEnglish && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-600">
              English
            </label>

            <Input
              value={form.englishName}
              placeholder="name"
              onChange={(e) => {
                setShowValidationError(false);

                setForm((prev) => ({
                  ...prev,
                  englishName: e.target.value,
                }));
              }}
            />
          </div>
        )}

        {showFrench && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-600">
              Français
            </label>

            <Input
              value={form.frenchName ?? ""}
              placeholder="name"
              onChange={(e) => {
                setShowValidationError(false);

                setForm((prev) => ({
                  ...prev,
                  frenchName: e.target.value,
                }));
              }}
            />
          </div>
        )}

        {showArabic && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-600">
              Arabic
            </label>

            <Input
              value={form.arabicName ?? ""}
              placeholder="name"
              onChange={(e) => {
                setShowValidationError(false);

                setForm((prev) => ({
                  ...prev,
                  arabicName: e.target.value,
                }));
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