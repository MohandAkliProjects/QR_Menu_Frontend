import { Trash2 } from "lucide-react";
import Input from "../Input";
import SelectDropdown from "../SelectDropdown";

const SOCIAL_PLATFORMS = ["FaceBook", "Instagram", "Google Maps", "TikTok", "Snapchat"];

interface SocialMediaItemProps {
  platform: string;
  url: string;
  isEditing?: boolean;
  onPlatformChange?: (value: string) => void;
  onUrlChange?: (value: string) => void;
  onDelete?: () => void;
}

function SocialMediaItem({
  platform, url, isEditing,
  onPlatformChange, onUrlChange, onDelete,
}: SocialMediaItemProps) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-32 shrink-0">
        <SelectDropdown
          value={platform}
          options={SOCIAL_PLATFORMS}
          onChange={onPlatformChange}
          disabled={!isEditing}
        />
      </div>

      <div className="flex-1 min-w-0">
        {!isEditing && url ? (
          
          <a  href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center h-12 px-4 rounded-xl border border-primary-200 bg-card-bg text-text-800 text-base truncate hover:border-primary-400 transition-colors duration-200"
          >
            <span className="truncate">{url}</span>
          </a>
        ) : (
          <Input
            value={url}
            readOnly={!isEditing}
            placeholder="https://..."
            onChange={(e) => onUrlChange?.(e.target.value)}
          />
        )}
      </div>

      {isEditing && onDelete && (
        <button
          onClick={onDelete}
          className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0 text-error hover:bg-error/10 transition-colors duration-200"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}

export default SocialMediaItem;