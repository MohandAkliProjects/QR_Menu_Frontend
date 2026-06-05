import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";
import CategoryImageUpload from "./CategoryImageUpload";
import { Trash2, Check } from "lucide-react";
import type { Category } from "./CategoryRow";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Omit<Category, "id" | "order">) => void;
  editData?: Category | null;
}

type FormState = Omit<Category, "id" | "order">;

const EMPTY: FormState = {
  english: "",
  french: "",
  arabic: "",
  icon: null,
  status: "visible",
};

function AddCategoryModal({ isOpen, onClose, onConfirm, editData }: AddCategoryModalProps) {
  const [form, setForm] = useState<FormState>(
    editData
      ? {
          english: editData.english,
          french: editData.french ?? "",
          arabic: editData.arabic ?? "",
          icon: editData.icon,
          status: editData.status,
        }
      : EMPTY
  );
  const [error, setError] = useState("");

  const field = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleConfirm = () => {
    if (!form.english.trim()) {
      setError("English name is required.");
      return;
    }
    setError("");
    onConfirm(form);
    onClose();
  };

  const handleDelete = () => {
    setError("");
    onClose();
  };

  return (
    <Modal
      title={editData ? "Edit Categorie" : "Add New Categorie"}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex gap-4 w-full">
          <Button
            label="Delete"
            icon={Trash2}
            onClick={handleDelete}
            fullWidth
            className="!bg-transparent !border !border-error !text-error hover:!bg-error/10"
          />
          <Button
            label="Confirme"
            icon={Check}
            onClick={handleConfirm}
            fullWidth
          />
        </div>
      }
    >
      {/* Upload */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-[420px]">
          <CategoryImageUpload
            preview={form.icon}
            onChange={(_, preview) => setForm((prev) => ({ ...prev, icon: preview }))}
          />
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-600">English</label>
          <Input
            value={form.english}
            placeholder="name"
            onChange={field("english")}
            error={error}
          />
          {error && <span className="text-xs text-error">{error}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-600">Francais</label>
          <Input
            value={form.french ?? ""}
            placeholder="name"
            onChange={field("french")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-600">Arabic</label>
          <Input
            value={form.arabic ?? ""}
            placeholder="name"
            onChange={field("arabic")}
          />
        </div>
      </div>
    </Modal>
  );
}

export default AddCategoryModal;