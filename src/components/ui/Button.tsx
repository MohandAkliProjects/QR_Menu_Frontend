import type { LucideIcon } from "lucide-react";

interface ButtonProps {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: "submit" | "button" | "reset" | undefined 
  variant?: "primary" | "secondary";
}

function Button({ label, icon: Icon, onClick, disabled, fullWidth, className, type , variant = "primary" }: ButtonProps) {
  const base = `
    flex items-center justify-center gap-3 px-3 py-4 rounded-lg
    h-12 ${fullWidth ? "w-full" : "w-auto"}
    text-base font-medium transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer
  `;

  const variants = {
    primary: "text-cream-500 bg-primary-700 hover:bg-primary-700/90 active:bg-gold-600",
    secondary: "text-text-600 bg-transparent border border-primary-300 hover:bg-primary-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className ?? ""}`}
      type={type}
    >
      {Icon && <Icon size={18} className="text-beige-600" />}
      {label}
    </button>
  );
}

export default Button;