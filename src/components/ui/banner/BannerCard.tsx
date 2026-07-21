import { Eye, EyeOff, Trash2 } from "lucide-react";

interface BannerCardProps {
  src: string;
  visible?: boolean;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
  onPreview?: () => void;
}

function BannerCard({
  src,
  visible = true,
  onDelete,
  onToggleVisibility,
  onPreview,
}: BannerCardProps) {
  return (
    <div
      onClick={onPreview}
      className="
        relative group
        w-62 h-40
        shadow-var(--shadow-card)
        rounded-2xl
        border border-primary-500
        overflow-hidden
        shrink-0
        cursor-pointer
      "
    >
      <img
        src={src}
        alt="Banner"
        className={`w-full h-auto object-cover object-center transition-all duration-200 ${
          !visible ? "opacity-40" : ""
        }`}
      />

      <div
        className="
          absolute inset-0
          bg-dark-900/60
          opacity-0 pointer-events-none
          group-hover:opacity-100
          group-hover:pointer-events-auto
          transition-all duration-200
          flex items-center justify-center gap-3
        "
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility?.();
          }}
          className="text-cream-500 hover:text-gold-400 transition-colors"
        >
          {visible ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="text-cream-500 hover:text-error transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}

export default BannerCard;
