import { useState, useCallback } from "react";
import type { ToastItem } from "../components/ui/ToastContainer";

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((
    variant: ToastItem["variant"],
    title: string,
    message: string
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, variant, title, message }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
}

export default useToast;