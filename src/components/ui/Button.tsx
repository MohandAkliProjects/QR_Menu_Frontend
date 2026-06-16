import type { LucideIcon } from "lucide-react";

interface ButtonProps {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: "submit" | "button" | "reset" | undefined;
  variant?: "primary" | "secondary";
}

function Button({
  label,
  icon: Icon,
  onClick,
  disabled,
  fullWidth,
  className,
  type,
  variant = "primary",
}: ButtonProps) {
  const base = `
    flex items-center justify-center gap-2.5 px-4 py-4 rounded-lg
    h-12 ${fullWidth ? "w-full" : "w-auto"}
    text-base font-medium transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer
  `;

  const variants = {
    primary: {
      button: "text-cream-500 bg-primary-700 hover:bg-primary-700/90 active:bg-gold-600",
      icon: "text-cream-500",
    },
    secondary: {
      button: "text-primary-700 bg-transparent border border-primary-300 hover:bg-primary-50 hover:border-primary-500 active:bg-primary-100",
      icon: "text-primary-600",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant].button} ${className ?? ""}`}
      type={type}
    >
      {Icon && <Icon size={18} className={variants[variant].icon} />}
      {label}
    </button>
  );
}

export default Button;