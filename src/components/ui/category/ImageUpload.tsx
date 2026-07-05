import { useRef } from "react";
import { Upload } from "lucide-react";
import { generalText } from "../../../../src/pages/admin/text/General.text.ts";
import { useLanguage } from "../../../i18n/useLanguage";
import ToastContainer from "../ToastContainer";
import useToast from "../../../hooks/useToast";

interface ImageUploadProps {
  preview: string | null;
  onChange: (file: File, preview: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function ImageUpload({ preview, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toasts, showToast, removeToast } = useToast();
  const { language } = useLanguage();
  const gt = generalText[language];
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("error", gt.imageUploadErrorTitle, gt.imageUploadUnsupportedFileTypeError)
      return;
    }
    const reader = new FileReader();

    if (file.size > MAX_FILE_SIZE) {
      showToast("error", gt.imageUploadErrorTitle, gt.imageUploadMaxSizeExceededError)
      return;
    }

    reader.onload = () => onChange(file, reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <>
    <ToastContainer toasts={toasts} onClose={removeToast} />
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="
        w-full h-48 rounded-xl border-2 border-dashed border-primary-300
        bg-primary-50 flex flex-col items-center justify-center gap-2
        cursor-pointer hover:border-primary-500 hover:bg-primary-100
        transition-all duration-200 overflow-hidden
      "
    >
      {preview ? (
        <img src={preview} alt="Category" className="w-full h-full object-cover" />
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <Upload size={22} className="text-primary-700" />
          </div>
          <p className="text-sm font-medium text-text-600">Tap to select</p>
          <p className="text-xs text-text-400">PNG, JPG up to 5MB</p>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
    </>
  );
}

export default ImageUpload;