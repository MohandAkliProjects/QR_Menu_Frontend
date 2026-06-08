import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";

interface AvatarUploadProps {
  isEditing?: boolean;
  initialUrl?: string | null;
  onFileSelected?: (file: File) => void;
  onDelete?: () => void;
}

function AvatarUpload({ isEditing, initialUrl, onFileSelected, onDelete }: AvatarUploadProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use local preview if user selected a file, otherwise fall back to initialUrl
  const preview = localPreview ?? initialUrl ?? null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const reader = new FileReader();
      reader.onload = () => setLocalPreview(reader.result as string);
      reader.readAsDataURL(blob);

      const pngFile = new File([blob], file.name.replace(/\.[^.]+$/, ".png"), {
        type: "image/png",
      });

      onFileSelected?.(pngFile);
    }, "image/png");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onDelete?.();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-3">
        <div
          className={`
            relative w-28 h-28 rounded-2xl overflow-hidden
            bg-primary-100 border-2 border-primary-200
            ${isEditing ? "cursor-pointer group" : ""}
          `}
          onClick={() => isEditing && inputRef.current?.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt="Restaurant logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-700 select-none">S</span>
            </div>
          )}

          {isEditing && (
            <div className="
              absolute inset-0 bg-dark-700/50
              flex flex-col items-center justify-center gap-1
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
            ">
              <Camera size={20} className="text-cream-500" />
              <span className="text-xs text-cream-500 font-medium">Change</span>
            </div>
          )}
        </div>

        {isEditing && preview && (
          <button
            type="button"
            onClick={handleDelete}
            className="
              flex items-center gap-1.5 px-3 py-1.5
              text-xs text-error border border-error/30
              rounded-lg hover:bg-error/10 transition-colors
            "
          >
            <Trash2 size={13} />
            Remove logo
          </button>
        )}
      </div>

      {isEditing && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {isEditing && (
        <p className="text-xs text-text-400">
          {preview ? "Click image to change" : "Click to upload logo"}
        </p>
      )}
    </div>
  );
}

export default AvatarUpload;