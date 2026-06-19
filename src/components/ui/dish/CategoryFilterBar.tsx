import type { UniqueIdentifier } from "@dnd-kit/core";

interface FilterCategory {
  id: UniqueIdentifier;
  label: string;
}

interface CategoryFilterBarProps {
  categories: FilterCategory[];
  selected: UniqueIdentifier | null;
  onSelect: (id: UniqueIdentifier) => void;
}

function CategoryFilterBar({
  categories,
  selected,
  onSelect,
}: CategoryFilterBarProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-2 min-w-max">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap hover:cursor-pointer
              ${
                selected === cat.id
                  ? "bg-primary-700 text-cream-500 border-primary-700"
                  : "bg-transparent border-beige-400 text-text-500 hover:bg-beige-200"
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryFilterBar;