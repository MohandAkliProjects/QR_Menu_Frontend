import { useRef, useState } from "react";
import { Upload, Trash2, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getErrorMessage } from "../../api/errors";
import PageHeader from "../../components/shared/PageHeader";
import PageErrorState from "../../components/shared/PageErrorState";
import PageLoadingState from "../../components/shared/PageLoadingState";
import SubTitle from "../../components/shared/SubTitle";
import Button from "../../components/ui/Button";
import Notification from "../../components/shared/Notification";
import BannerCard from "../../components/ui/banner/BannerCard";
import ImagePreview from "../../components/ui/ImagePreview";
import ToastContainer from "../../components/ui/ToastContainer";
import { useAuth } from "../../context/AuthContext";
import useToast from "../../hooks/useToast";
import * as restaurantService from "../../services/restaurant.service";

const MAX_BANNERS = 3;

interface Banner {
  id: string;
  src: string;
  visible: boolean;
}

function mapBanners(data: Awaited<ReturnType<typeof restaurantService.getBanners>>): Banner[] {
  return (data.banners ?? []).map((b) => ({
    id: b.id,
    src: b.imageUrl,
    visible: b.visible,
  }));
}

function BannersPage() {
  const { restaurantId } = useAuth();
  const queryClient = useQueryClient();
  const { toasts, showToast, removeToast } = useToast();

  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bannersKey = ["banners", restaurantId];

  const {
    data: banners = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: bannersKey,
    queryFn: async () => {
      const data = await restaurantService.getBanners(restaurantId!);
      return mapBanners(data);
    },
    enabled: !!restaurantId,
  });

  const addBannerMutation = useMutation({
    mutationFn: (file: File) =>
      restaurantService.addBanner(restaurantId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannersKey });
      handleDeletePreview();
      showToast("success", "Banner Added", "Your banner has been uploaded.");
    },
    onError: (err) =>
      showToast("error", "Upload Failed", getErrorMessage(err)),
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (id: string) =>
      restaurantService.deleteBanner(restaurantId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannersKey });
      showToast("success", "Banner Deleted", "Banner has been removed.");
    },
    onError: (err) =>
      showToast("error", "Delete Failed", getErrorMessage(err)),
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      restaurantService.updateBannerVisibility(restaurantId!, id, visible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannersKey });
    },
    onError: (err) =>
      showToast("error", "Update Failed", getErrorMessage(err)),
  });

  const isLimitReached = banners.length >= MAX_BANNERS;

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setPendingFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function handleDeletePreview() {
    setPreview(null);
    setPendingFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="w-full min-h-screen p-6 sm:p-8 lg:p-12">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="w-full flex flex-col gap-8">
        <PageHeader title="Banners" />

        {isLoading ? (
          <PageLoadingState message="Loading banners..." />
        ) : isError ? (
          <PageErrorState
            message={getErrorMessage(error, "Could not load banners.")}
            onRetry={refetch}
          />
        ) : (
          <>
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
                      w-full max-w-120 h-80
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
                      className={isLimitReached ? "text-gold-500" : "text-primary-400"}
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
                        onClick={handleDeletePreview}
                        className="flex-1 bg-transparent! border! border-error! text-error! hover:bg-error/10!"
                      />
                      <Button
                        label={addBannerMutation.isPending ? "Uploading..." : "Confirm"}
                        icon={Check}
                        onClick={() => pendingFile && addBannerMutation.mutate(pendingFile)}
                        disabled={addBannerMutation.isPending}
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
                      onDelete={() => deleteBannerMutation.mutate(banner.id)}
                      onToggleVisibility={() =>
                        toggleVisibilityMutation.mutate({
                          id: banner.id,
                          visible: !banner.visible,
                        })
                      }
                      onPreview={() => setSelectedBanner(banner.src)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
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