import { useEffect, useRef, useState } from "react";
import type { RestaurantInfo } from "../../types/api";
import { Mail, MapPin, Phone } from "lucide-react";

interface SocialLinksBarProps {
  restaurant: RestaurantInfo;
  hideFloating?: boolean;
}

interface SocialLink {
  label: string;
  color: string;
  iconColor?: string;
  href: string;
  icon: React.ReactNode;
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function SnapchatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 120 120" fill="currentColor">
      <path d="M60 8C38 8 22 24 22 46v32l-10 10h22c0 14 11.6 26 26 26s26-12 26-26h22l-10-10V46C98 24 82 8 60 8z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.93a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1-.31z" />
    </svg>
  );
}

function SocialLinksBar({ restaurant, hideFloating = false }: SocialLinksBarProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const links: SocialLink[] = [];

  if (restaurant.instagramLink) {
    links.push({
      label: "Instagram",
      color: "#E1306C",
      href: restaurant.instagramLink,
      icon: <InstagramIcon />,
    });
  }

  if (restaurant.facebookLink) {
    links.push({
      label: "Facebook",
      color: "#1877F2",
      href: restaurant.facebookLink,
      icon: <FacebookIcon />,
    });
  }

  if (restaurant.tiktokLink) {
    links.push({
      label: "TikTok",
      color: "#010101",
      href: restaurant.tiktokLink,
      icon: <TikTokIcon />,
    });
  }

  if (restaurant.snapchatLink) {
    links.push({
      label: "Snapchat",
      color: "#FFFC00",
      iconColor: "#111",
      href: restaurant.snapchatLink,
      icon: <SnapchatIcon />,
    });
  }

  if (restaurant.phones && restaurant.phones.length === 1) {
    links.push({
      label: "Call",
      color: "#34A853",
      href: `tel:${restaurant.phones[0]}`,
      icon: <Phone className="w-5 h-5" />,
    });
  }

  if (restaurant.emailAddress) {
    links.push({
      label: "Email",
      color: "#EA4335",
      href: `mailto:${restaurant.emailAddress}`,
      icon: <Mail className="w-5 h-5" />,
    });
  }

  if (restaurant.googleMapsLink) {
    links.push({
      label: "Maps",
      color: "#4285F4",
      href: restaurant.googleMapsLink,
      icon: <MapPin className="w-5 h-5" />,
    });
  }
  const floatingLinks = links.filter(
    (link) => link.label !== "Call" && link.label !== "Maps",
  );

  if (links.length === 0) return null;

  return (
    <>
      <div
        ref={sectionRef}
        className="rounded-3xl border border-[var(--menu-border)] bg-[var(--menu-card)] shadow-sm p-4"
      >
        <h3 className="text-base font-semibold text-[var(--menu-primary)] mb-3 menu-font-display">
          Follow &amp; Contact
        </h3>

        <div className="flex flex-wrap gap-3">
          {links.map((link) => {
            const isExternal = link.href.startsWith("http");

            return (
              <a
                key={link.label}
                href={link.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
                className="flex items-center gap-2 pe-4 ps-3 py-2.5 rounded-2xl shadow-sm active:scale-95 transition-transform"
                style={{
                  backgroundColor: link.color,
                  color: link.iconColor ?? "#fff",
                }}
              >
                {link.icon}
                <span className="text-sm font-bold">{link.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {!isVisible && !hideFloating && floatingLinks.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
          {floatingLinks.map((link) => {
            const isExternal = link.href.startsWith("http");

            return (
              <a  
                key={`floating-${link.label}`}
                href={link.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
                className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                style={{
                  backgroundColor: link.color,
                  color: link.iconColor ?? "#fff",
                }}
                title={link.label}
              >
                {link.icon}
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}

export default SocialLinksBar;