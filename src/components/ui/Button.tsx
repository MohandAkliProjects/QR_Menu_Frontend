import type { LucideIcon } from "lucide-react";

interface ButtonProps {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
   className?: string;
}

function Button({ label, icon: Icon, onClick, disabled, fullWidth, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-3 px-3 py-4 rounded-lg
        h-12 ${fullWidth ? "w-full" : "w-auto"} ${className} 
        text-base font-medium text-cream-500 
        bg-primary-700 hover:bg-primary-700/90 active:bg-gold-600
        transition-all duration-200
        shadow-var(--shadow-card)
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {Icon && <Icon size={18} className="text-beige-600" />}
      {label}
    </button>
  );
}

export default Button;