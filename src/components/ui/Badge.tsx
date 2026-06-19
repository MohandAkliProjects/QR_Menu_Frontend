import { useLanguage } from "../../i18n/useLanguage";
import { badgeText } from "./text/Badge.text";

type BadgeVariant = "visible" | "hidden" | "available" | "unavailable";

interface BadgeProps {
  variant: BadgeVariant;
}

const classMap: Record<BadgeVariant, string> = {
  visible: "border border-primary-400 text-primary-600 bg-primary-50",
  hidden: "border border-gold-500 text-gold-600 bg-gold-50",
  available: "border border-primary-400 text-primary-600 bg-primary-50",
  unavailable: "border border-gold-500 text-gold-600 bg-gold-50",
};

function Badge({ variant }: BadgeProps) {
  const { language } = useLanguage();
  const t = badgeText[language];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-transparent ${classMap[variant]}`}
    >
      {t[variant]}
    </span>
  );
}

export default Badge;