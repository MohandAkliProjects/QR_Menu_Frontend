interface EmptyCategoryProps {
  title?: string;
  message?: string;
  hint?: string;
}

function EmptyCategory({
  title = "No items available",
  message = "No dishes available in this category.",
  hint = "Please check another category or come back later.",
}: EmptyCategoryProps) {
  return (
    <div className="flex flex-col items-center py-16 px-8 text-center">
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center mb-5 bg-[var(--menu-secondary)]"
        style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.06)" }}
      >
        <span className="text-5xl" role="img" aria-label="empty">🍽️</span>
      </div>
      <h3 className="text-base font-semibold text-[var(--menu-primary)] mb-2 menu-font-display">
        {title}
      </h3>
      <p className="text-sm text-[var(--menu-muted)] leading-relaxed">{message}</p>
      <p className="text-xs text-[var(--menu-muted)]/70 mt-1">{hint}</p>
    </div>
  );
}

export default EmptyCategory;