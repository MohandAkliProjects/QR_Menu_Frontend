import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";
import CategoryImageUpload from "./CategoryImageUpload";
import Notification from "../../shared/Notification";
import { Trash2, Check } from "lucide-react";
import type { Category } from "./CategoryRow";
import type { Language } from "../../../types/enums";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Omit<Category, "id" | "order"> & { iconFile: File | null }) => void;
  editData?: Category | null;
  supportedLanguages: Language[];
}

type FormState = Omit<Category, "id" | "order"> & {
  iconFile: File | null;
};

const EMPTY: FormState = {
  english: "",
  french: "",
  arabic: "",
  icon: null,
  iconFile: null,
  status: "visible",
};

function AddCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  editData,
  supportedLanguages,
}: AddCategoryModalProps) {
  const [form, setForm] = useState<FormState>(
    editData
      ? {
          english: editData.english,
          french: editData.french ?? "",
          arabic: editData.arabic ?? "",
          icon: editData.icon,
          iconFile: null,
          status: editData.status,
        }
      : EMPTY
  );
  const [error, setError] = useState("");

  const showEnglish = supportedLanguages.includes("EN" as Language);
  const showFrench = supportedLanguages.includes("FR" as Language);
  const showArabic = supportedLanguages.includes("AR" as Language);

  const missingLanguages: string[] = [];
  if (showEnglish && !form.english.trim()) missingLanguages.push("English");
  if (showFrench && !form.french?.trim()) missingLanguages.push("French");
  if (showArabic && !form.arabic?.trim()) missingLanguages.push("Arabic");

  const handleConfirm = () => {
    if (showEnglish && !form.english.trim()) {
      setError("English name is required.");
      return;
    }
    setError("");
    onConfirm(form);
    onClose();
  };

  return (
    <Modal
      title={editData ? "Edit Category" : "Add New Category"}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex gap-4 w-full">
          <Button
            label="Cancel"
            icon={Trash2}
            onClick={onClose}
            fullWidth
            className="!bg-transparent !border !border-error !text-error hover:!bg-error/10"
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
      {/* Missing languages warning */}
      {missingLanguages.length > 0 && (
        <Notification
          variant="warning"
          title="Missing Translations"
          message={`Please fill in: ${missingLanguages.join(", ")}`}
        />
      )}

      {/* Icon upload */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-[420px]">
          <CategoryImageUpload
            preview={form.icon}
            onChange={(file, preview) =>
              setForm((prev) => ({ ...prev, icon: preview, iconFile: file }))
            }
          />
        </div>
      </div>

      {/* Language fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {showEnglish && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-600">English</label>
            <Input
              value={form.english}
              placeholder="name"
              onChange={(e) => setForm((prev) => ({ ...prev, english: e.target.value }))}
              error={error}
            />
            {error && <span className="text-xs text-error">{error}</span>}
          </div>
        )}
        {showFrench && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-600">Français</label>
            <Input
              value={form.french ?? ""}
              placeholder="name"
              onChange={(e) => setForm((prev) => ({ ...prev, french: e.target.value }))}
            />
          </div>
        )}
        {showArabic && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-600">Arabic</label>
            <Input
              value={form.arabic ?? ""}
              placeholder="name"
              onChange={(e) => setForm((prev) => ({ ...prev, arabic: e.target.value }))}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

export default AddCategoryModal;