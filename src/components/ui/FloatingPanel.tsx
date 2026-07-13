import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface FloatingPanelProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

const MAX_PANEL_HEIGHT = 280; // hard cap — beyond this, content scrolls instead of the panel growing

function FloatingPanel({ anchorRef, open, onClose, children, width = 224 }: FloatingPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number; maxHeight: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      const gap = 8;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;

      const flip = spaceBelow < 160 && spaceAbove > spaceBelow;
      const available = flip ? spaceAbove : spaceBelow;
      const maxHeight = Math.min(MAX_PANEL_HEIGHT, Math.max(120, available));

      const left = Math.min(
        Math.max(8, rect.left + rect.width / 2 - width / 2),
        window.innerWidth - width - 8,
      );

      setPos(
        flip
          ? { bottom: window.innerHeight - rect.top + gap, left, maxHeight }
          : { top: rect.bottom + gap, left, maxHeight },
      );
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, anchorRef, width]);

  // Drive the enter/exit transition on the next frame so it actually
  // animates instead of popping in/out at full opacity/scale immediately.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(open));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        anchorRef.current && !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      style={{
        position: "fixed",
        top: pos.top,
        bottom: pos.bottom,
        left: pos.left,
        width,
        maxHeight: pos.maxHeight,
        zIndex: 9999,
        transformOrigin: pos.bottom !== undefined ? "bottom center" : "top center",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1) translateY(0)" : `scale(0.96) translateY(${pos.bottom !== undefined ? "4px" : "-4px"})`,
        transition: "opacity 120ms ease-out, transform 120ms ease-out",
      }}
      className="
        overflow-y-auto rounded-xl border border-beige-300 bg-card-bg
        shadow-lg p-3
        scrollbar-thin [scrollbar-color:var(--color-beige-400)_transparent]
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-beige-400
        [&::-webkit-scrollbar-thumb]:rounded-full
      "
    >
      {children}
    </div>,
    document.body,
  );
}

export default FloatingPanel;