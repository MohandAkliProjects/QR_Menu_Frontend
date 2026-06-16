import { ChevronDown } from "lucide-react";

interface SelectDropdownProps {
  value: string;
  options: string[];
  onChange?: (value: string) => void;
  disabled?: boolean;
}

function SelectDropdown({ value, options, onChange, disabled }: SelectDropdownProps) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="
          w-full appearance-none h-12 pl-4 pr-10 rounded-xl
          bg-card-bg border border-primary-200
          text-base text-text-800
          focus:outline-none focus:border-primary-500
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200 cursor-pointer
        "
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-400 pointer-events-none"
      />
    </div>
  );
}

export default SelectDropdown;