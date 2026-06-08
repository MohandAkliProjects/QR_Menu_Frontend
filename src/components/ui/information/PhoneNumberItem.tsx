import { Trash2 } from "lucide-react";
import Input from "../Input";

interface PhoneNumberItemProps {
  value: string;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  onDelete?: () => void;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

function PhoneNumberItem({ value, isEditing, onChange, onDelete }: PhoneNumberItemProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onChange?.(formatted);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          value={value}
          readOnly={!isEditing}
          placeholder="05 45 78 52 54"
          onChange={handleChange}
        />
      </div>
      {isEditing && onDelete && (
        <button
          onClick={onDelete}
          className="
            w-10 h-10 flex items-center justify-center rounded-lg shrink-0
            text-error hover:bg-error-bg transition-colors duration-200
          "
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}

export default PhoneNumberItem;