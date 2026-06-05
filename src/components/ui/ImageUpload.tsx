import { useState, useRef } from "react";
import { Upload, Trash2, Check } from "lucide-react";
import Button from "./Button";

interface ImageUploadProps {
  onConfirm?: (file: File) => void;
}

function ImageUpload({ onConfirm }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function handleDelete() {
    setPreview(null);
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleConfirm() {
    if (file && onConfirm) onConfirm(file);
  }

  return (
    <div className="flex flex-col gap-4 w-full ">

      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="
            flex flex-col items-center justify-center gap-3
            w-full min-h-50 sm:min-h-60
            border-2 border-dashed border-primary-400
            rounded-2xl cursor-pointer
            bg-transparent
            hover:border-primary-600 hover:bg-primary-50
            transition-all duration-200
          "
        >
          <Upload size={36} className="text-primary-500" />
          <p className="text-base font-medium text-primary-500">
            Tap to select
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">

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
              className="flex-1 bg-transparent! border border-error text-error hover:bg-error/10!"
            />
            <Button
              label="Confirm"
              icon={Check}
              onClick={handleConfirm}
              className="flex-1 bg-info! hover:bg-info/90!"
            />
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
  );
}

export default ImageUpload;
