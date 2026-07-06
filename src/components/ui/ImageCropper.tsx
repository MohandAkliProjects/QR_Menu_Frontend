import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { Check, X } from "lucide-react";
import Button from "./Button";

interface ImageCropperProps {
  imageSrc: string;
  aspect: number;
  onCancel: () => void;
  onConfirm: (croppedFile: File) => void;
  fileName?: string;
  objectFit?: "cover" | "contain"; // "cover" = fill frame (dishes/banners), "contain" = show whole image (logos)
}

function getCroppedImg(
  imageSrc: string,
  cropPixels: Area,
  fileName: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = cropPixels.width;
      canvas.height = cropPixels.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // no fill — transparent by default, matters mainly for "contain" mode
      ctx.drawImage(
        image,
        cropPixels.x,
        cropPixels.y,
        cropPixels.width,
        cropPixels.height,
        0,
        0,
        cropPixels.width,
        cropPixels.height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas toBlob failed"));
          return;
        }
        resolve(new File([blob], fileName, { type: "image/png" }));
      }, "image/png");
    };

    image.onerror = () => reject(new Error("Failed to load image"));
  });
}

function ImageCropper({
  imageSrc,
  aspect,
  onCancel,
  onConfirm,
  fileName = "cropped.png",
  objectFit = "cover",
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    const file = await getCroppedImg(imageSrc, croppedAreaPixels, fileName);
    onConfirm(file);
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      {/* crop stage */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          objectFit={objectFit}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          cropShape={aspect === 1 && objectFit === "cover" ? "round" : "rect"}
          showGrid={objectFit === "cover" && aspect !== 1}
        />
      </div>

      {/* control sheet */}
      <div
        className="
          flex-shrink-0 relative
          bg-primary-900 px-5 pt-5 pb-6
          rounded-t-2xl
          flex flex-col gap-5
          shadow-[0_-8px_24px_rgba(0,0,0,0.35)]
        "
      >
        <div className="mx-auto -mt-1 h-1 w-10 rounded-full bg-primary-700/60" />

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-primary-300 w-10 shrink-0">
            Zoom
          </span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-cream-500 cursor-pointer"
          />
        </div>

        <div className="flex gap-3 w-full">
          <Button
            label="Cancel"
            icon={X}
            onClick={onCancel}
            className="flex-1 bg-transparent! border border-primary-600 text-primary-200 hover:bg-primary-800!"
          />
          <Button
            label="Confirm"
            icon={Check}
            onClick={handleConfirm}
            className="flex-1 bg-cream-500! text-primary-900! hover:bg-cream-400!"
          />
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;