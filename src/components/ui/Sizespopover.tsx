import { useState, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import FloatingPanel from "./FloatingPanel";
import type { DishSize } from "../../types/api";
import type { Devise } from "../../types";
import { DEVISE_SYMBOLS } from "../../lib/constants/devise";

interface SizesPopoverProps {
  sizes: DishSize[];
  devise: Devise;
}

export function SizesPopover({ sizes, devise }: SizesPopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (!sizes.length) return <span className="text-sm text-text-300 select-none">—</span>;

  if (sizes.length === 1) {
    return (
      <span className="text-sm text-text-600">
        {DEVISE_SYMBOLS[devise]} {sizes[0].price}
      </span>
    );
  }

  const prices = sizes.map((s) => s.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-text-600 hover:bg-beige-100 transition-colors"
      >
        <span className="whitespace-nowrap">
          {DEVISE_SYMBOLS[devise]} {min} – {DEVISE_SYMBOLS[devise]} {max}
        </span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-text-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <FloatingPanel anchorRef={triggerRef} open={open} onClose={() => setOpen(false)} width={200}>
        <div className="flex flex-col gap-1.5">
          {sizes.map((size, i) => (
            <div key={i} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate max-w-24 text-text-700">{size.name || "—"}</span>
              <span className="text-text-500 shrink-0">
                {DEVISE_SYMBOLS[devise]} {size.price}
              </span>
            </div>
          ))}
        </div>
      </FloatingPanel>
    </>
  );
}

interface SizesEditorProps {
  sizes: DishSize[];
  onChange: (sizes: DishSize[]) => void;
  devise: Devise;
  addSizeLabel: string;
  sizeNamePlaceholder: string;
  error?: string;
}

export function SizesEditor({
  sizes,
  onChange,
  devise,
  addSizeLabel,
  sizeNamePlaceholder,
  error,
}: SizesEditorProps) {
  const updateSize = (index: number, patch: Partial<DishSize>) => {
    onChange(sizes.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addSize = () => {
    onChange([...sizes, { name: "", price: 0 }]);
  };

  const removeSize = (index: number) => {
    onChange(sizes.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full py-1">
      {sizes.map((size, index) => (
        <div key={index} className="flex items-center gap-1">
          <input
            value={size.name}
            placeholder={sizeNamePlaceholder}
            onChange={(e) => updateSize(index, { name: e.target.value })}
            className="w-16 h-8 px-2 rounded-md border border-beige-400 text-xs text-center text-dark-700 bg-cream-200 focus:outline-none focus:border-primary-500"
          />
          <span className="text-xs text-text-400 shrink-0">{DEVISE_SYMBOLS[devise]}</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={size.price}
            onChange={(e) => updateSize(index, { price: Number(e.target.value) })}
            className="w-16 h-8 px-1 rounded-md border border-beige-400 text-xs text-center text-dark-700 bg-cream-200 focus:outline-none focus:border-primary-500"
          />
          {sizes.length > 1 && (
            <button
              type="button"
              onClick={() => removeSize(index)}
              className="text-text-400 hover:text-error transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addSize}
        className="text-xs text-primary-700 hover:underline self-center"
      >
        + {addSizeLabel}
      </button>
      {error && <span className="text-xs text-error text-center">{error}</span>}
    </div>
  );
}