import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function Modal({ title, isOpen, onClose, children, footer }: ModalProps) {

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-dark-700/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* panel */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-card-bg rounded-2xl shadow-lg flex flex-col">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200">
          <h3 className="text-lg font-semibold text-dark-700">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-400 hover:bg-primary-100 hover:text-dark-700 transition-colors hover:cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {children}
        </div>

        {/* footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-primary-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;