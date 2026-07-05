import { createPortal } from "react-dom";
import Toast from "./Toast";

export interface ToastItem {
  id: number;
  variant: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: number) => void;
}

function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return createPortal(
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          title={toast.title}
          message={toast.message}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
}

export default ToastContainer;