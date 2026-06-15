import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import type { RestaurantInfo } from "../types/api";

interface RestaurantInfoCardProps {
  restaurant: RestaurantInfo;
}

/**
 * New component, replacing the contact half of the Figma `RestaurantInfo`.
 * Dropped vs. the Figma version:
 * - "Opening Hours" block (no hours field on `RestaurantInfo` yet -
 *   the map block below has room for it once the backend adds it)
 *
 * Social icons live in `SocialFab` instead of being duplicated here.
 */
function RestaurantInfoCard({ restaurant }: RestaurantInfoCardProps) {
  const location = restaurant.address || restaurant.ville;
  const phones = restaurant.phones ?? [];

  const hasContactInfo = phones.length > 0 || restaurant.emailAddress;

  if (!location && !hasContactInfo) return null;

  return (
    <div className="rounded-3xl overflow-hidden border border-[var(--menu-border)] bg-[var(--menu-card)] shadow-sm">
      {location && (
        <div className="h-28 relative flex flex-col items-center justify-center gap-2 bg-[var(--menu-secondary)]">
          <MapPin className="w-7 h-7 text-[var(--menu-primary)] opacity-40" />
          <p className="text-xs text-[var(--menu-muted)] text-center px-10 leading-snug">{location}</p>
          {restaurant.googleMapsLink && (
            <a
              href={restaurant.googleMapsLink}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-3 end-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow bg-[var(--menu-primary)]"
            >
              <ExternalLink className="w-3 h-3" /> Open in Maps
            </a>
          )}
        </div>
      )}

      {hasContactInfo && (
        <div className="p-4 pb-5 space-y-3">
          <h3 className="text-base font-semibold text-[var(--menu-primary)] mb-2 menu-font-display">
            Contact
          </h3>

          {phones.map((phone) => (
            <a key={phone} href={`tel:${phone}`} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--menu-secondary)] flex items-center justify-center flex-shrink-0">
                <Phone className="w-3.5 h-3.5 text-[var(--menu-primary)]" />
              </span>
              <span className="text-sm text-[var(--menu-foreground)]">{phone}</span>
            </a>
          ))}

          {restaurant.emailAddress && (
            <a href={`mailto:${restaurant.emailAddress}`} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--menu-secondary)] flex items-center justify-center flex-shrink-0">
                <Mail className="w-3.5 h-3.5 text-[var(--menu-primary)]" />
              </span>
              <span className="text-sm text-[var(--menu-foreground)]">{restaurant.emailAddress}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default RestaurantInfoCard;