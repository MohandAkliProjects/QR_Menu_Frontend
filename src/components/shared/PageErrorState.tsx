import { RefreshCw } from "lucide-react";
import Notification from "./Notification";
import Button from "../ui/Button";

interface PageErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

function PageErrorState({
  title = "Failed to load data",
  message,
  onRetry,
}: PageErrorStateProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto py-8">
      <Notification variant="error" title={title} message={message} />
      {onRetry && (
        <Button
          label="Try Again"
          icon={RefreshCw}
          onClick={onRetry}
          className="w-fit mx-auto"
        />
      )}
    </div>
  );
}

export default PageErrorState;
