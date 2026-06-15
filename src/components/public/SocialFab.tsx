import { useState } from "react";
import { Ghost, Mail, MapPin, Phone, Share2, X } from "lucide-react";

import type { RestaurantInfo } from "../../types/api";

interface SocialFabProps {
  restaurant: RestaurantInfo;
}

interface SocialAction {
  label: string;
  color: string;
  iconColor?: string;
  href: string;
  icon: React.ReactNode;
}

function TikTokIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.93a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1-.31z" />
    </svg>
  );
}

/**
 * Replaces `SocialLinks`. Builds the action list from whatever links the
 * Replaces `SocialLinks`. Builds the action list from whatever links the
 * renders nothing if there's nothing to show. Mirrors to the opposite
 * side of the screen automatically in RTL via `end-4`.
 */
function SocialFab({ restaurant }: SocialFabProps) {
  const [open, setOpen] = useState(false);
// lucide-react doesn't export an Instagram icon name; use an inline SVG instead
/*function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.5A4.5 4.5 0 1 0 16.5 13 4.5 4.5 0 0 0 12 8.5zm6.5-3.75a1.125 1.125 0 1 0 1.125 1.125A1.125 1.125 0 0 0 18.5 4.75z" />
    </svg>
  );
}*/

  const actions: SocialAction[] = [];

  if (restaurant.instagramLink) {
    actions.push({
      label: "Instagram",
      color: "#E1306C",
      href: restaurant.instagramLink, 
      icon: < Mail className="w-4 h-4" />,
    });
  }
  if (restaurant.facebookLink) {
    actions.push({
      label: "Facebook",
      color: "#1877F2",
      href: restaurant.facebookLink,
      icon: <Ghost className="w-4 h-4" />,
    });
  }
  if (restaurant.tiktokLink) {
    actions.push({
      label: "TikTok",
      color: "#010101",
      href: restaurant.tiktokLink,
      icon: <TikTokIcon />,
    });
  }
  if (restaurant.snapchatLink) {
    actions.push({
      label: "Snapchat",
      color: "#FFFC00",
      iconColor: "#1a1a1a",
      href: restaurant.snapchatLink,
      icon: <Ghost className="w-4 h-4" />,
    });
  }
  if (restaurant.phones?.[0]) {
    actions.push({
      label: "Call Us",
      color: "#34A853",
      href: `tel:${restaurant.phones[0]}`,
      icon: <Phone className="w-4 h-4" />,
    });
  }
  if (restaurant.emailAddress) {
    actions.push({
      label: "Email",
      color: "#EA4335",
      href: `mailto:${restaurant.emailAddress}`,
      icon: <Mail className="w-4 h-4" />,
    });
  }
  if (restaurant.googleMapsLink) {
    actions.push({
      label: "Location",
      color: "#4285F4",
      href: restaurant.googleMapsLink,
      icon: <MapPin className="w-4 h-4" />,
    });
  }

  if (actions.length === 0) return null;

  return (
    <div className="fixed end-4 bottom-6 z-40 flex flex-col items-end gap-2">
      {actions.map((action, i) => {
        const isExternal = action.href.startsWith("http");
        return (
          <a
            key={action.label}
            href={action.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            className="flex items-center gap-2 transition-all duration-300"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0) scale(1)" : "translateY(10px) scale(0.88)",
              transitionDelay: open ? `${i * 35}ms` : `${(actions.length - 1 - i) * 22}ms`,
              pointerEvents: open ? "auto" : "none",
            }}
          >
            <span className="bg-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md text-gray-700 whitespace-nowrap">
              {action.label}
            </span>
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: action.color, color: action.iconColor ?? "#ffffff" }}
            >
              {action.icon}
            </span>
          </a>
        );
      })}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl transition-transform duration-200 active:scale-90 bg-[var(--menu-primary)]"
        aria-label="Social links"
      >
        <div className="transition-transform duration-300" style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
          {open ? <X className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
        </div>
      </button>
    </div>
  );
}

export default SocialFab;