import { useCallback } from "react";
import { Copy, Download, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import PageHeader from "../../components/shared/PageHeader";
import PageErrorState from "../../components/shared/PageErrorState";
import PageLoadingState from "../../components/shared/PageLoadingState";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import SubTitle from "../../components/shared/SubTitle";
import ToastContainer from "../../components/ui/ToastContainer";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/useLanguage";
import useToast from "../../hooks/useToast";
import { ROUTES } from "../../types/routes";
import * as restaurantService from "../../services/restaurant.service";
import * as menuService from "../../services/menu.service";
import { qrDisplayText } from "./text/QrDisplayPage.text";

function getMenuTitle(
  translations: Record<string, { title: string }>,
  language: "en" | "fr",
): string {
  const key = language === "fr" ? "fr" : "en";
  return (
    translations[key]?.title ??
    translations.en?.title ??
    Object.values(translations)[0]?.title ??
    "Menu"
  );
}

type QrDisplayText = (typeof qrDisplayText)[keyof typeof qrDisplayText];

function MenuQrCard({
  menuId,
  menuKey,
  title,
  slug,
  isDefault,
  t,
  onCopy,
  onDownload,
  onTest,
}: {
  menuId: string;
  menuKey: string;
  title: string;
  slug: string;
  isDefault: boolean;
  t: QrDisplayText;
  onCopy: (url: string) => void;
  onDownload: (elementId: string, filename: string) => void;
  onTest: (url: string) => void;
}) {



  const displayUrl = `${window.location.origin}${ROUTES.publicMenu(slug, menuKey)}`;
  const canvasId = `qr-canvas-${menuId}`;

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-lg font-semibold text-dark-800">{title}</h3>
        {isDefault && (
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border border-primary-400 text-primary-600 bg-primary-50">
            {t.defaultMenuBadge}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        {displayUrl ? (
          <QRCodeSVG
            id={canvasId}
            value={displayUrl}
            size={200}
            className="w-44 h-44 sm:w-48 sm:h-48"
          />
        ) : (
          <p className="text-small text-text-300 text-center">
            {t.noQrCode}
          </p>
        )}

        <p className="text-xs text-text-300 text-center break-all px-2">
          {displayUrl || t.noPublicUrl}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            <Input value={displayUrl} readOnly />
          </div>

          <Button
            label={t.copyMenuUrl}
            icon={Copy}
            onClick={() => onCopy(displayUrl)}
            className="whitespace-nowrap w-auto shrink-0"
            disabled={!displayUrl}
          />
        </div>

        <div className="flex gap-3">
          <Button
            label={t.downloadQr}
            icon={Download}
            className="flex-1"
            onClick={() =>
              onDownload(
                canvasId,
                `${title.replace(/\s+/g, "-").toLowerCase()}-qr.svg`
              )
            }
            disabled={!displayUrl}
          />

          <Button
            label={t.testUrl}
            icon={ExternalLink}
            className="flex-1"
            onClick={() => onTest(displayUrl)}
            disabled={!displayUrl}
          />
        </div>
      </div>
    </Card>
  );
}

function SingleMenuQrView({
  menuKey,
  title,
  slug,
  t,
  onCopy,
  onDownload,
  onTest,
}: {
  menuId: string;
  menuKey: string;
  title: string;
  slug: string;
  t: QrDisplayText;
  onCopy: (url: string) => void;
  onDownload: (elementId: string, filename: string) => void;
  onTest: (url: string) => void;
}) {

  const displayUrl = `${window.location.origin}${ROUTES.publicMenu(slug, menuKey)}`;
  const canvasId = "qr-canvas-active";

  return (
    <div className="flex flex-col gap-8 w-full">
      <SubTitle
        title={t.yourQrCodeTitle}
        description={`${t.yourQrCodeDescription} — ${title}`}
        showDescription={true}
      />
      <div id="qr-canvas-active-wrapper">
        <Card
          className="
            flex flex-col items-center justify-center gap-6
            w-full
            max-w-sm sm:max-w-md md:max-w-135 lg:max-w-135 xl:max-w-145
            min-h-80 sm:min-h-80 md:min-h-87
            mx-auto py-8 px-6 sm:py-10 sm:px-10
          "
        >
          {displayUrl ? (
            <QRCodeSVG
              id={canvasId}
              value={displayUrl}
              size={256}
              className="w-36 h-36 sm:w-48 sm:h-48 lg:w-64 lg:h-64"
            />
          ) : (
            <p className="text-small text-text-300 text-center">
              {t.noQrCode}
            </p>
          )}
          <p className="text-small text-text-300 text-center truncate w-full px-4">
            {displayUrl || t.noPublicUrl}
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <SubTitle title={t.publicMenuUrlTitle} />
        <div
          className="
            flex gap-4 w-full
            max-w-sm sm:max-w-md md:max-w-150 lg:max-w-175 xl:max-w-250
            mx-auto
          "
        >
          <div className="flex-1 min-w-0">
            <Input value={displayUrl} readOnly />
          </div>
          <Button
            label={t.copyMenuUrl}
            icon={Copy}
            onClick={() => onCopy(displayUrl)}
            className="whitespace-nowrap w-auto shrink-0"
            disabled={!displayUrl}
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
          label={t.downloadQr}
          icon={Download}
          className="flex-1"
          onClick={() =>
            onDownload(
              canvasId,
              `${title.replace(/\s+/g, "-").toLowerCase()}-qr.svg`,
            )
          }
          disabled={!displayUrl}
        />
        <Button
          label={t.testUrl}
          icon={ExternalLink}
          className="flex-1"
          onClick={() => onTest(displayUrl)}
          disabled={!displayUrl}
        />
      </div>
    </div>
  );
}

function QrDisplayPage() {
  const { restaurantId } = useAuth();
  const { language } = useLanguage();
  const t = qrDisplayText[language];
  const { toasts, showToast, removeToast } = useToast();

  const { data: restaurant, isLoading: restaurantLoading, isError, refetch } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => restaurantService.getRestaurant(restaurantId!),
    enabled: !!restaurantId,
    staleTime: Infinity,
  });

  const { data: menus = [], isLoading: menusLoading } = useQuery({
    queryKey: ["menus", restaurantId],
    queryFn: () => menuService.getMenusByRestaurant(restaurantId!),
    enabled: !!restaurantId,
    staleTime: Infinity,
  });

  const handleCopy = useCallback(
    async (url: string) => {
      if (!url) return;
      try {
        await navigator.clipboard.writeText(url);
        showToast("success", t.toastCopiedTitle, t.toastCopiedMessage);
      } catch {
        showToast("error", t.toastCopyFailedTitle, t.toastCopyFailedMessage);
      }
    },
    [showToast, t],
  );

  const handleTest = useCallback((url: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const handleDownload = useCallback(
    (elementId: string, filename: string) => {
      const svg = document.getElementById(elementId) as SVGSVGElement | null;
      if (!svg) {
        showToast(
          "error",
          t.toastDownloadFailedTitle,
          t.toastDownloadFailedMessage,
        );
        return;
      }

      const svgClone = svg.cloneNode(true) as SVGSVGElement;
      svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

      const svgString = new XMLSerializer().serializeToString(svgClone);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(url);
      showToast("success", t.toastDownloadedTitle, t.toastDownloadedMessage);
    },
    [showToast, t],
  );

  const isLoading = restaurantLoading || menusLoading;

  return (
    <div className="w-full p-6 sm:p-8 lg:p-12">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="w-full flex flex-col gap-8">
        <PageHeader title={t.pageTitle} showDescription={false} />

        {isLoading ? (
          <PageLoadingState message={t.loading} />
        ) : isError ? (
          <PageErrorState onRetry={refetch} />
        ) : menus.length === 0 ? (
          <>
            <SubTitle
              title={t.yourQrCodeTitle}
              description={t.yourQrCodeDescription}
              showDescription
            />
            <Card className="p-8 text-center text-text-300">{t.noQrCode}</Card>
          </>
        ) : menus.length === 1 ? (
          <SingleMenuQrView
            menuId={menus[0].id}
            menuKey={menus[0].publicKey ?? menus[0].id}
            title={getMenuTitle(menus[0].translations, language)}
            slug={restaurant?.slug ?? ""}
            t={t}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onTest={handleTest}
          />
        ) : (
          <>
            <SubTitle
              title={t.yourQrCodeTitle}
              description={t.yourQrCodeDescription}
              showDescription
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {menus.map((menu) => (
                <div key={menu.id}>
                  <MenuQrCard
                    menuId={menu.id}
                    menuKey={menu.publicKey ?? menu.id}
                    title={getMenuTitle(menu.translations, language)}
                    slug={restaurant?.slug ?? ""}
                    isDefault={restaurant?.defaultMenuId === menu.id}
                    t={t}
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                    onTest={handleTest}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default QrDisplayPage;