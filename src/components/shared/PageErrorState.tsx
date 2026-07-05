import { RefreshCw } from "lucide-react";
import Notification from "./Notification";
import Button from "../ui/Button";
import { generalText } from "../../pages/admin/text/General.text";
import { useLanguage } from "../../i18n/useLanguage";

interface PageErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

function PageErrorState({
  title,
  message,
  onRetry,
}: PageErrorStateProps) {
  const { language } = useLanguage();
  const gt = generalText[language];
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto py-8">
      <Notification variant="error" title={title ?? gt.errorTitle} message={message ?? gt.error} />
      {onRetry && (
        <Button
          label={gt.tryAgain}
          icon={RefreshCw}
          onClick={onRetry}
          className="w-fit mx-auto"
        />
      )}
    </div>
  );
}

export default PageErrorState;
