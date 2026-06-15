import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import type { RestaurantInfo } from "../../types/api";

interface RestaurantInfoCardProps {
  restaurant: RestaurantInfo;
}

// ── Map helpers ──────────────────────────────────────────────────────────────

/**
 * Tries to extract a lat/lng pair from a Google Maps URL.
 * Handles the common patterns:
 *   - /@lat,lng,zoom
 *   - /place/.../@lat,lng
 *   - ?q=lat,lng
 *   - ll=lat,lng
 */
function extractCoordsFromGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  try {
    // /@lat,lng or /place/.../lat,lng
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    }

    const parsed = new URL(url);

    // ?q=lat,lng
    const q = parsed.searchParams.get("q");
    if (q) {
      const qMatch = q.match(/^(-?\d+\.\d+),(-?\d+\.\d+)$/);
      if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    }

    // ll=lat,lng (older embed format)
    const ll = parsed.searchParams.get("ll");
    if (ll) {
      const llMatch = ll.match(/^(-?\d+\.\d+),(-?\d+\.\d+)$/);
      if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
    }
  } catch {
    // URL parsing failed — fall through
  }
  return null;
}

/**
 * Builds an OpenStreetMap embed src.
 *
 * Priority:
 * 1. Coords extracted from the googleMapsLink
 * 2. Address text search via Nominatim embed
 * 3. City/ville text search
 */
function buildMapSrc(restaurant: RestaurantInfo): string | null {
  // 1. Google Maps link with parseable coords → pin on OSM
  if (restaurant.googleMapsLink) {
    const coords = extractCoordsFromGoogleMapsUrl(restaurant.googleMapsLink);
    if (coords) {
      const { lat, lng } = coords;
      const delta = 0.003; // ~300 m bounding box
      const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
      return (
        `https://www.openstreetmap.org/export/embed.html` +
        `?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
      );
    }
  }

  // 2. Street address text search
  if (restaurant.address) {
    const query = encodeURIComponent(
      [restaurant.address, restaurant.ville].filter(Boolean).join(", ")
    );
    return `https://www.openstreetmap.org/export/embed.html?query=${query}&layer=mapnik`;
  }

  // 3. City/ville only
  if (restaurant.ville) {
    const query = encodeURIComponent(restaurant.ville);
    return `https://www.openstreetmap.org/export/embed.html?query=${query}&layer=mapnik`;
  }

  return null;
}

// ── Component ────────────────────────────────────────────────────────────────

function RestaurantInfoCard({ restaurant }: RestaurantInfoCardProps) {
  const location = restaurant.address || restaurant.ville;
  const phones = restaurant.phones ?? [];
  const hasContactInfo = phones.length > 0 || restaurant.emailAddress;

  const mapSrc = buildMapSrc(restaurant);

  if (!location && !hasContactInfo) return null;

  return (
    <div className="rounded-3xl overflow-hidden border border-[var(--menu-border)] bg-[var(--menu-card)] shadow-sm">

      {/* ── Map block ── */}
      {location && (
        <div className="relative" style={{ height: 180 }}>
          {mapSrc ? (
            <>
              <iframe
                title="Restaurant location"
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin"
              />
              {/* Overlay strip at the bottom with address + optional "Open in Maps" */}
              <div
                className="absolute bottom-0 inset-x-0 flex items-center justify-between gap-2 px-4 py-2"
                style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-white flex-shrink-0 opacity-80" />
                  <p className="text-[11px] text-white leading-snug truncate">{location}</p>
                </div>
                {restaurant.googleMapsLink && (
                  <a
                    href={restaurant.googleMapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: "var(--menu-accent)" }}
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    Maps
                  </a>
                )}
              </div>
            </>
          ) : (
            /* No map possible — show the old static placeholder */
            <div className="h-full relative flex flex-col items-center justify-center gap-2 bg-[var(--menu-secondary)]">
              <MapPin className="w-7 h-7 text-[var(--menu-primary)] opacity-40" />
              <p className="text-xs text-[var(--menu-muted)] text-center px-10 leading-snug">
                {location}
              </p>
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
        </div>
      )}

      {/* ── Contact block ── */}
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