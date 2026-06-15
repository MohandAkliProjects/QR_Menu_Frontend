import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * New component (the Figma version was inline). Pure UI - the actual
 * filtering happens in PublicMenuPage so it can search across
 * translations in the active language.
 */
function SearchBar({ value, onChange, placeholder = "Search dishes…" }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--menu-muted)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full ps-10 pe-9 py-2.5 bg-[var(--menu-card)] rounded-xl border border-[var(--menu-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--menu-accent)]/30 transition-all placeholder:text-[var(--menu-muted)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--menu-secondary)] flex items-center justify-center"
        >
          <X className="w-3 h-3 text-[var(--menu-muted)]" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;