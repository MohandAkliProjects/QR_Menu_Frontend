import { Trash2 } from "lucide-react";
import Input from "../Input";

interface PhoneNumberItemProps {
  value: string;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  onDelete?: () => void;
}

function PhoneNumberItem({ value, isEditing, onChange, onDelete }: PhoneNumberItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          value={value}
          readOnly={!isEditing}
          placeholder="e.g. 05 58 76 58 96"
          onChange={(e) => onChange?.(e.target.value)}
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