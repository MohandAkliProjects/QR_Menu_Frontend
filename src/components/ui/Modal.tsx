import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isPending: boolean;
  footer?: React.ReactNode;
}

function Modal({ title, isOpen, onClose, isPending, children, footer }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, isPending]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-dark-700/50 backdrop-blur-sm"
        onClick={!isPending ? onClose : undefined}
      />

      <div className="relative z-10 w-full max-w-lg mx-4 bg-card-bg rounded-2xl shadow-lg flex flex-col max-h-[90vh] overflow-hidden">

        {/* Loading bar */}
        {isPending && (
          <div className="absolute top-0 inset-x-0 h-0.5 z-20 bg-primary-100 overflow-hidden rounded-t-2xl">
            <div className="h-full bg-primary-600 animate-[progress_1.4s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200 shrink-0">
          <h3 className="text-lg font-semibold text-dark-700">{title}</h3>
          <button
            onClick={!isPending ? onClose : undefined}
            disabled={isPending}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-400 hover:bg-primary-100 hover:text-dark-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-primary-200 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;