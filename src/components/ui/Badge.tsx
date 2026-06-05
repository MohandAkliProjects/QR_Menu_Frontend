type BadgeVariant = "visible" | "hidden" | "available" | "unavailable";

interface BadgeProps {
  variant: BadgeVariant;
}

const config = {
  visible: {
    label: "Visible",
    className: "border border-primary-400 text-text-600",
  },
  hidden: {
    label: "Hidden",
    className: "border border-error text-error",
  },
  available: {
    label: "Available",
    className: "border border-primary-400 text-text-600",
  },
  unavailable: {
    label: "Unavailable",
    className: "border border-error text-error",
  },
};

function Badge({ variant }: BadgeProps) {
  const { label, className } = config[variant];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-transparent ${className}`}>
      {label}
    </span>
  );
}

export default Badge;