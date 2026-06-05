import { Copy, Download, ExternalLink } from "lucide-react";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import qrCode from "../../assets/qr_code.svg";
import SubTitle from "../../components/shared/SubTitle";

function QrDisplayPage() {
  const qrUrl =
    "https://qrmenus.blob.core.windows.net/qrcodes/qr_6a1164f5f802129cecb57...";

  function handleCopy() {
    navigator.clipboard.writeText(qrUrl);
  }

  return (
    <div className="w-full min-h-screen p-6 sm:p-8 lg:p-12">
      <div className="w-full flex flex-col gap-8">
        <PageHeader
          title="QR Display"
          description="Test one two there "
          showDescription={false}
        />

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
              src={qrCode}
              alt="QR Code"
              className="w-36 h-36 sm:w-48 sm:h-48 lg:w-64 lg:h-64 object-contain"
            />
            <p className="text-small text-text-300 text-center truncate w-full px-4">
              {qrUrl}
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
          <Button label="Download URL" icon={Download} className="flex-1" />
          <Button label="Test URL" icon={ExternalLink} className="flex-1" />
        </div>
      </div>
    </div>
  );
}

export default QrDisplayPage;
