import { useRef, useState } from "react";
import { Camera } from "lucide-react";

interface AvatarUploadProps {
  isEditing?: boolean;
  initialUrl?: string | null;
  onFileSelected?: (file: File) => void;
}

function AvatarUpload({ isEditing, initialUrl, onFileSelected }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    onFileSelected?.(file);
  };

  return (
    <div className="flex flex-col gap-2">
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
        <p className="text-xs text-text-400">Click to upload logo</p>
      )}
    </div>
  );
}

export default AvatarUpload;