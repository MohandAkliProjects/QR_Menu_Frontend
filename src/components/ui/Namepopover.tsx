import { useState, useRef, useLayoutEffect } from "react";
import { ChevronDown } from "lucide-react";

interface NamePopoverProps {
  label: string;
  dir?: "ltr" | "rtl";
}

function NamePopover({ label, dir = "ltr" }: NamePopoverProps) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const isTruncated = label.length > 14;

  // Decide popover direction based on actual available space,
  // instead of relying on an isFirst/isLast prop from the parent row.
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUp(spaceAbove > 150 && spaceAbove > spaceBelow);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!isTruncated) {
    return <span className="text-sm text-text-600">{label}</span>;
  }

  return (
    <div ref={ref} className="relative flex justify-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center px-2 py-1 rounded-lg text-sm text-text-600 hover:bg-beige-100 transition-colors max-w-30"
      >
        {/* Text alone drives the centered width — chevron is positioned
            outside of it so it no longer skews the text off-center. */}
        <span className="truncate">{label}</span>
        <ChevronDown
          size={13}
          className={`absolute left-full ml-1 shrink-0 text-text-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div
          className={`
            absolute z-50 left-1/2 -translate-x-1/2
            ${openUp ? "bottom-full mb-2" : "top-full mt-2"}
            w-max max-w-50 rounded-xl border border-beige-300
            bg-card-bg shadow-lg px-3 py-2
          `}
        >
          <div
            className={`
              absolute left-1/2 -translate-x-1/2
              w-3 h-3 rotate-45 bg-card-bg border-beige-300
              ${openUp ? "-bottom-1.5 border-r border-b" : "-top-1.5 border-l border-t"}
            `}
          />
          <p dir={dir} className="text-sm text-text-700 whitespace-normal wrap-break-words">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}

export default NamePopover;