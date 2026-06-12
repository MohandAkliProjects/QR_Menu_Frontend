import { useState } from "react";
import { Phone, Mail, Map } from "lucide-react";
import type { RestaurantInfo } from "../../types";

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
    </svg>
  );
}

interface Props {
  restaurant: RestaurantInfo;
}

function isValid(v?: string | null): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export default function SocialLinks({ restaurant }: Props) {
  const [open, setOpen] = useState(false);

  const links = [
    isValid(restaurant.instagramLink) && {
      href: restaurant.instagramLink,
      icon: <InstagramIcon />,
      label: "Instagram",
    },
    isValid(restaurant.facebookLink) && {
      href: restaurant.facebookLink,
      icon: <FacebookIcon />,
      label: "Facebook",
    },
    isValid(restaurant.tiktokLink) && {
      href: restaurant.tiktokLink,
      icon: <TiktokIcon />,
      label: "TikTok",
    },
    isValid(restaurant.phones?.[0]) && {
      href: `tel:${restaurant.phones![0]}`,
      icon: <Phone className="w-4 h-4" />,
      label: "Call",
    },
    isValid(restaurant.emailAddress) && {
      href: `mailto:${restaurant.emailAddress}`,
      icon: <Mail className="w-4 h-4" />,
      label: "Email",
    },
    isValid(restaurant.googleMapsLink) && {
      href: restaurant.googleMapsLink,
      icon: <Map className="w-4 h-4" />,
      label: "Maps",
    },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string }[];

  if (links.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2">
      <div
        className={`flex flex-col items-end gap-2 transition-all duration-300 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background-primary shadow-lg border border-border-tertiary text-sm text-dark-800 hover:text-primary-700 hover:border-primary-700 transition-all duration-200 whitespace-nowrap"
          >
            <span className="text-text-400">{link.icon}</span>
            {link.label}
          </a>
        ))}
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full bg-primary-700 text-white shadow-lg flex items-center justify-center hover:bg-primary-800 active:scale-95 transition-all duration-200"
        aria-label={open ? "Close links" : "Show contact links"}
      >
        <span className={`text-xl font-bold transition-transform duration-300 ${open ? "rotate-45" : "rotate-0"}`}>
          +
        </span>
      </button>
    </div>
  );
}