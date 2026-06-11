import type { LucideIcon } from "lucide-react";

interface IconInputProps {
  icon: LucideIcon;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  className?: string;
}

function IconInput({ icon: Icon, type = "text", placeholder, value, onChange, error, className }: IconInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`
        flex items-center gap-3 h-12 px-4 rounded-xl
        bg-card-bg border transition-all duration-200
        ${error ? "border-error" : "border-primary-200 focus-within:border-primary-500"}
      `}>
        <Icon size={18} className="text-text-400 shrink-0" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`flex-1 bg-transparent text-base text-dark-700 placeholder:text-text-400 focus:outline-none ${className ?? ""}`}
        />
      </div>
      {error && <p className="text-xs text-error pl-1">{error}</p>}
    </div>
  );
}

export default IconInput;