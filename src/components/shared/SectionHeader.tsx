import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function SectionHeader({ icon: Icon, title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
          <Icon size={20} className="text-primary-700" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold text-dark-700">{title}</span>
          {description && (
            <span className="text-sm text-text-400">{description}</span>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export default SectionHeader;