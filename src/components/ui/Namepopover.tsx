import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import FloatingPanel from "./FloatingPanel";

interface NamePopoverProps {
  label: string;
  dir?: "ltr" | "rtl";
}

function NamePopover({ label, dir = "ltr" }: NamePopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isTruncated = label.length > 14;

  if (!isTruncated)
    return <span className="text-sm text-text-600">{label}</span>;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-text-600 hover:bg-beige-100 transition-colors max-w-30"
      >
        <span className="truncate">{label}</span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-text-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <FloatingPanel anchorRef={triggerRef} open={open} onClose={() => setOpen(false)} width={200}>
        <p dir={dir} className="text-sm text-text-700 whitespace-normal wrap-break-words">
          {label}
        </p>
      </FloatingPanel>
    </>
  );
}

export default NamePopover;