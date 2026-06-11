import { useCallback } from "react";
import { Copy, Download, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { QRCodeCanvas } from "qrcode.react";

import { getErrorMessage } from "../../api/errors";
import PageHeader from "../../components/shared/PageHeader";
import PageErrorState from "../../components/shared/PageErrorState";
import PageLoadingState from "../../components/shared/PageLoadingState";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import SubTitle from "../../components/shared/SubTitle";
import ToastContainer from "../../components/ui/ToastContainer";
import { useAuth } from "../../context/AuthContext";
import useToast from "../../hooks/useToast";
import { ROUTES } from "../../types/routes";
import * as restaurantService from "../../services/restaurant.service";

function QrDisplayPage() {
  const { restaurantId } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => restaurantService.getRestaurant(restaurantId!),
    enabled: !!restaurantId,
    staleTime: Infinity,
    select: (restaurant) => ({
      qrUrl: `${window.location.origin}${ROUTES.qrRedirect(restaurantId!)}`,
      qrDisplayUrl: restaurant.slug
        ? `${window.location.origin}${ROUTES.publicMenu(restaurant.slug)}`
        : "",
    }),
  });

  const qrUrl = data?.qrUrl ?? "";
  const qrDisplayUrl = data?.qrDisplayUrl ?? "";

  const handleCopy = useCallback(async () => {
    if (!qrDisplayUrl) return;
    try {
      await navigator.clipboard.writeText(qrDisplayUrl);
      showToast("success", "Copied", "Public menu URL copied to clipboard.");
    } catch {
      showToast("error", "Copy Failed", "Could not copy the URL.");
    }
  }, [qrDisplayUrl, showToast]);

  function handleTest() {
    if (!qrDisplayUrl) return;
    window.open(qrDisplayUrl, "_blank", "noopener,noreferrer");
  }

  function handleDownload() {
    if (!qrUrl) {
      showToast("error", "No QR Code", "No QR code has been generated yet.");
      return;
    }
    const canvas = document.querySelector<HTMLCanvasElement>("canvas");
    if (!canvas) {
      showToast("error", "Download Failed", "Could not find QR code canvas.");
      return;
    }
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "restaurant-qr.png";
    link.click();
    showToast("success", "Downloaded", "QR image download started.");
  }

  return (
    <div className="w-full  p-6 sm:p-8 lg:p-12">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="w-full flex flex-col gap-8">
        <PageHeader title="QR Display" showDescription={false} />

        {isLoading ? (
          <PageLoadingState message="Loading QR display..." />
        ) : isError ? (
          <PageErrorState
            message={getErrorMessage(error, "Could not load QR information.")}
            onRetry={refetch}
          />
        ) : (
          <>
            <div className="flex flex-col gap-8 w-full">
              <SubTitle
                title="Your QR Code"
                description="Guests scan this code to open your public menu in their browser."
                showDescription={true}
              />
              <Card
                className="
                  flex flex-col items-center justify-center gap-6
                  w-full
                  max-w-sm sm:max-w-md md:max-w-135 lg:max-w-135 xl:max-w-145
                  min-h-80 sm:min-h-80 md:min-h-87
                  mx-auto py-8 px-6 sm:py-10 sm:px-10
                "
              >
                {qrUrl ? (
                  <QRCodeCanvas
                    value={qrUrl}
                    size={256}
                    className="w-36 h-36 sm:w-48 sm:h-48 lg:w-64 lg:h-64"
                  />
                ) : (
                  <p className="text-small text-text-300 text-center">
                    No QR code available. Please set a default menu first.
                  </p>
                )}
                <p className="text-small text-text-300 text-center truncate w-full px-4">
                  {qrDisplayUrl || "No public menu URL configured yet."}
                </p>
              </Card>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <SubTitle title="Public Menu URL" />
              <div
                className="
                  flex gap-4 w-full
                  max-w-sm sm:max-w-md md:max-w-150 lg:max-w-175 xl:max-w-250
                  mx-auto
                "
              >
                <div className="flex-1 min-w-0">
                  <Input value={qrDisplayUrl} readOnly />
                </div>
                <Button
                  label="Copy Menu URL"
                  icon={Copy}
                  onClick={handleCopy}
                  className="whitespace-nowrap w-auto shrink-0"
                  disabled={!qrDisplayUrl}
                />
              </div>
            </div>

            <div
              className="
                flex gap-6 w-full m-6
                max-w-sm sm:max-w-md md:max-w-150 lg:max-w-175 xl:max-w-200
                mx-auto
              "
            >
              <Button
                label="Download QR"
                icon={Download}
                className="flex-1"
                onClick={handleDownload}
                disabled={!qrUrl}
              />
              <Button
                label="Test URL"
                icon={ExternalLink}
                className="flex-1"
                onClick={handleTest}
                disabled={!qrDisplayUrl}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default QrDisplayPage;
