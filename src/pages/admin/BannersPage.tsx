import { useState, useRef } from "react";
import { Upload, Trash2, Check } from "lucide-react";
import PageHeader from "../../components/shared/PageHeader";
import SubTitle from "../../components/shared/SubTitle";
import Button from "../../components/ui/Button";
import Notification from "../../components/shared/Notification";
import BannerCard from "../../components/ui/banner/BannerCard";
import ImagePreview from "../../components/ui/ImagePreview";

const MAX_BANNERS = 3;

interface Banner {
  id: string;
  src: string;
  visible: boolean;
}

function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const isLimitReached = banners.length >= MAX_BANNERS;

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];

    if (!selected) return;

    setPreview(URL.createObjectURL(selected));
  }

  function handleDelete() {
    setPreview(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleConfirm() {
    if (!preview) return;

    setBanners((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        src: preview,
        visible: true,
      },
    ]);

    setPreview(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleDeleteBanner(id: string) {
    setBanners((prev) => prev.filter((banner) => banner.id !== id));
  }

  function handleToggleVisibility(id: string) {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === id ? { ...banner, visible: !banner.visible } : banner,
      ),
    );
  }

  return (
    <div className="w-full min-h-screen p-6 sm:p-8 lg:p-12">
      <div className="w-full flex flex-col gap-8">
        <PageHeader title="Banners" />

        <div className="flex flex-col gap-4 w-full">
          <SubTitle
            title="Manage Banners"
            description="Upload up to 3 banner images for your menu carousel"
            showDescription={true}
          />

          {isLimitReached && (
            <Notification
              variant="warning"
              title="Banner Limit Reached"
              message="You have reached the maximum of 3 banners. Remove an existing banner to upload a new one."
            />
          )}

          {!preview ? (
            <div className="w-full flex justify-center">
              <div
                onClick={() => !isLimitReached && inputRef.current?.click()}
                className={`
          flex flex-col items-center justify-center gap-4
          w-full max-w-120
          h-80
          border-2 border-dashed rounded-2xl
          transition-all duration-200
          ${
            isLimitReached
              ? "border-gold-500 cursor-not-allowed opacity-60"
              : "border-primary-400 cursor-pointer hover:border-primary-600 hover:bg-primary-50"
          }
        `}
              >
                <Upload
                  size={56}
                  className={
                    isLimitReached ? "text-gold-500" : "text-primary-400"
                  }
                />

                <p
                  className={`text-base font-medium ${
                    isLimitReached ? "text-gold-500" : "text-primary-400"
                  }`}
                >
                  Tap to select a banner
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="flex flex-col gap-4 w-full max-w-150">
                <img
                  src={preview}
                  alt="Banner preview"
                  className="w-full max-h-75 object-cover rounded-2xl"
                />

                <div className="flex gap-4 w-full">
                  <Button
                    label="Delete"
                    icon={Trash2}
                    onClick={handleDelete}
                    className="flex-1 bg-transparent! border! border-error! text-error! hover:bg-error/10!"
                  />

                  <Button
                    label="Confirm"
                    icon={Check}
                    onClick={handleConfirm}
                    className="flex-1 bg-info! hover:bg-info/90!"
                  />
                </div>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleSelect}
            className="hidden"
          />
        </div>

        <div className="flex flex-col gap-4 w-full mx-auto">
          <SubTitle
            title="Current Banners"
            description="Hover on the image to edit"
            showDescription={true}
          />

          {banners.length === 0 ? (
            <Notification
              variant="info"
              title="No Banners Yet"
              message="Upload your first banner to display promotional content in your menu carousel."
              className="w-full"
            />
          ) : (
            <div className="flex gap-4 flex-wrap">
              {banners.map((banner) => (
                <BannerCard
                  key={banner.id}
                  src={banner.src}
                  visible={banner.visible}
                  onDelete={() => handleDeleteBanner(banner.id)}
                  onToggleVisibility={() => handleToggleVisibility(banner.id)}
                  onPreview={() => setSelectedBanner(banner.src)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedBanner && (
        <ImagePreview
          src={selectedBanner}
          onClose={() => setSelectedBanner(null)}
        />
      )}
    </div>
  );
}

export default BannersPage;
