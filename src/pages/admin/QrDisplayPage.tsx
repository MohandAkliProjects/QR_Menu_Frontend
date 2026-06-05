import { useCallback, useEffect, useState } from "react";
import { Copy, Download, ExternalLink } from "lucide-react";

import { getErrorMessage } from "../../api/errors";
import PageHeader from "../../components/shared/PageHeader";
import PageErrorState from "../../components/shared/PageErrorState";
import PageLoadingState from "../../components/shared/PageLoadingState";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import qrCodeFallback from "../../assets/qr_code.svg";
import SubTitle from "../../components/shared/SubTitle";
import ToastContainer from "../../components/ui/ToastContainer";
import { useAuth } from "../../context/AuthContext";
import useToast from "../../hooks/useToast";
import { ROUTES } from "../../types/routes";
import * as restaurantService from "../../services/restaurant.service";

function QrDisplayPage() {
  const { restaurantId, menuId } = useAuth();
  const [qrImage, setQrImage] = useState(qrCodeFallback);
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  const loadQrData = useCallback(async () => {
    if (!restaurantId) {
      setError("Restaurant session is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const restaurant = await restaurantService.getRestaurant(restaurantId);
      const publicMenuId = restaurant.defaultMenuId ?? menuId;
      const publicUrl = publicMenuId
        ? `${window.location.origin}${ROUTES.publicMenu(publicMenuId)}`
        : "";

      setQrUrl(publicUrl);
      setQrImage(restaurant.qrCode || qrCodeFallback);
    } catch (err) {
      const message = getErrorMessage(err, "Could not load QR information.");
      setError(message);
      showToast("error", "Load Failed", message);
    } finally {
      setLoading(false);
    }
  }, [menuId, restaurantId, showToast]);

  useEffect(() => {
    loadQrData();
  }, [loadQrData]);

  async function handleCopy() {
    if (!qrUrl) return;
    try {
      await navigator.clipboard.writeText(qrUrl);
      showToast("success", "Copied", "Public menu URL copied to clipboard.");
    } catch {
      showToast("error", "Copy Failed", "Could not copy the URL.");
    }
  }

  function handleTest() {
    if (!qrUrl) return;
    window.open(qrUrl, "_blank", "noopener,noreferrer");
  }

  async function handleDownload() {
    try {
      const response = await fetch(qrImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "restaurant-qr.png";
      link.click();
      URL.revokeObjectURL(url);
      showToast("success", "Downloaded", "QR image download started.");
    } catch {
      showToast("error", "Download Failed", "Could not download the QR image.");
    }
  }

  return (
    <div className="w-full min-h-screen p-6 sm:p-8 lg:p-12">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="w-full flex flex-col gap-8">
        <PageHeader
          title="QR Display"
          description="Test one two there "
          showDescription={false}
        />

        {loading ? (
          <PageLoadingState message="Loading QR display..." />
        ) : error ? (
          <PageErrorState message={error} onRetry={loadQrData} />
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
                <img
                  src={qrImage}
                  alt="QR Code"
                  className="w-36 h-36 sm:w-48 sm:h-48 lg:w-64 lg:h-64 object-contain"
                />
                <p className="text-small text-text-300 text-center truncate w-full px-4">
                  {qrUrl || "No public menu URL configured yet."}
                </p>
              </Card>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <SubTitle title="Public Menu URL"></SubTitle>
              <div
                className="
            flex gap-4 w-full
            max-w-sm sm:max-w-md md:max-w-150 lg:max-w-175 xl:max-w-250
            mx-auto
          "
              >
                <div className="flex-1 min-w-0">
                  <Input value={qrUrl} readOnly />
                </div>
                <Button
                  label="Copy Menu URL"
                  icon={Copy}
                  onClick={handleCopy}
                  className="whitespace-nowrap w-auto shrink-0"
                  disabled={!qrUrl}
                />
              </div>
            </div>

            <div
              className="
          flex gap-6 w-full
          m-6
          max-w-sm sm:max-w-md md:max-w-150 lg:max-w-175 xl:max-w-200
          mx-auto
        "
            >
              <Button
                label="Download URL"
                icon={Download}
                className="flex-1"
                onClick={handleDownload}
              />
              <Button
                label="Test URL"
                icon={ExternalLink}
                className="flex-1"
                onClick={handleTest}
                disabled={!qrUrl}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default QrDisplayPage;
