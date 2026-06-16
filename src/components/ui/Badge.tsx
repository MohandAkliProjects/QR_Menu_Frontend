type BadgeVariant = "visible" | "hidden" | "available" | "unavailable";

interface BadgeProps {
  variant: BadgeVariant;
}

const config = {
  visible: {
    label: "Visible",
    className: "border border-primary-400 text-primary-600 bg-primary-50",
  },
  hidden: {
    label: "Hidden",
    className: "border border-gold-500 text-gold-600 bg-gold-50",
  },
  available: {
    label: "Available",
    className: "border border-primary-400 text-primary-600 bg-primary-50",
  },
  unavailable: {
    label: "Unavailable",
    className: "border border-gold-500 text-gold-600 bg-gold-50",
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