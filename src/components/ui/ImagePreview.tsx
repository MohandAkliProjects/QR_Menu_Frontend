import { X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  onClose: () => void;
}

function ImagePreview({ src, onClose }: ImagePreviewProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:opacity-80"
      >
        <X size={32} />
      </button>

      <img
        src={src}
        alt="Preview"
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain"
      />
    </div>
  );
}

export default ImagePreview;
