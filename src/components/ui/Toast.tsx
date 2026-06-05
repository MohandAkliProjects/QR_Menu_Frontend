import { useEffect } from "react";
import { CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";

type NotificationVariant = "success" | "info" | "warning" | "error";

interface ToastProps {
  variant: NotificationVariant;
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

const config = {
  success: {
    icon: CheckCircle,
    className: "bg-success-bg border border-success text-success",
  },
  info: {
    icon: Info,
    className: "bg-info-bg border border-info text-info",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-warning-bg border border-warning text-warning",
  },
  error: {
    icon: XCircle,
    className: "bg-error-bg border border-error text-error",
  },
};

function Toast({ variant, title, message, onClose, duration = 3000 }: ToastProps) {
  const { icon: Icon, className } = config[variant];

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`
      flex flex-col gap-1 px-4 py-3 rounded-lg shadow-lg
      w-full max-w-sm pointer-events-auto
      animate-slide-in
      ${className}
    `}>
      <div className="flex items-center gap-2">
        <Icon size={20} />
        <span className="font-semibold text-base">{title}</span>
      </div>
      <p className="text-sm pl-7">{message}</p>
    </div>
  );
}

export default Toast;