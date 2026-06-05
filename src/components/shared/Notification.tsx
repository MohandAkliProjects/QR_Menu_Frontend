import { CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";

type NotificationVariant = "success" | "info" | "warning" | "error";

interface NotificationProps {
  variant: NotificationVariant;
  title: string;
  message: string;
  className?: string;
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

function Notification({ variant, title, message, className }: NotificationProps) {
  const { icon: Icon, className: configClassName } = config[variant];

  return (
    <div className={`flex flex-col gap-1 px-4 py-3 rounded-lg ${configClassName} ${className || ""}`}>
      <div className="flex items-center gap-2">
        <Icon size={20} />
        <span className=" font-semibold text-base">{title}</span>
      </div>
      <p className=" font-regular text-sm text-beige-800 pl-7">{message}</p>
    </div>
  );
}

export default Notification;  