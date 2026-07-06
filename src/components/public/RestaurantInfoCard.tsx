import { useEffect, useState } from "react";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import type { RestaurantInfo } from "../../types/api";

interface RestaurantInfoCardProps {
  restaurant: RestaurantInfo;
  /** Whether to render the location map section. Defaults to true. */
  showMap?: boolean;
}

function extractCoordsFromGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  try {
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

    const parsed = new URL(url);

    const q = parsed.searchParams.get("q");
    if (q) {
      const qMatch = q.match(/^(-?\d+\.\d+),(-?\d+\.\d+)$/);
      if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    }

    const ll = parsed.searchParams.get("ll");
    if (ll) {
      const llMatch = ll.match(/^(-?\d+\.\d+),(-?\d+\.\d+)$/);
      if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
    }
  } catch {
    // fall through
  }
  return null;
}

function buildOsmIframeSrc(lat: number, lng: number): string {
  const delta = 0.005;
  return (
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${lng - delta},${lat - delta},${lng + delta},${lat + delta}` +
    `&layer=mapnik&marker=${lat},${lng}`
  );
}

async function geocodeAddress(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en", "User-Agent": "RestaurantMenuApp/1.0" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

async function resolveCoords(restaurant: RestaurantInfo): Promise<{ lat: number; lng: number } | null> {
  if (restaurant.googleMapsLink) {
    const coords = extractCoordsFromGoogleMapsUrl(restaurant.googleMapsLink);
    if (coords) return coords;
  }
  if (restaurant.address) {
    const coords = await geocodeAddress(restaurant.address);
    if (coords) return coords;
  }
  if (restaurant.ville) {
    const coords = await geocodeAddress(restaurant.ville);
    if (coords) return coords;
  }
  return null;
}

function RestaurantInfoCard({ restaurant, showMap = true }: RestaurantInfoCardProps) {
  const location = restaurant.address || restaurant.ville;
  const phones = restaurant.phones ?? [];
  const hasContactInfo = phones.length > 0 || restaurant.emailAddress;

  const [mapState, setMapState] = useState<{ ready: boolean; src: string | null }>({
    ready: false,
    src: null,
  });

  const mapReady = mapState.ready;
  const iframeSrc = mapState.src;

  useEffect(() => {
    if (!showMap) return;
    let cancelled = false;

    resolveCoords(restaurant).then((coords) => {
      if (!cancelled) {
        setMapState({
          ready: true,
          src: coords ? buildOsmIframeSrc(coords.lat, coords.lng) : "",
        });
      }
    });

    return () => { cancelled = true; };
  }, [showMap, restaurant.googleMapsLink, restaurant.address, restaurant.ville]);

  const showLocationBlock = showMap && !!location;

  if (!showLocationBlock && !hasContactInfo) return null;

  return (
    <div className="rounded-3xl overflow-hidden border border-[var(--menu-border)] bg-[var(--menu-card)] shadow-sm">

      {showLocationBlock && (
        <div className="relative" style={{ height: 180 }}>
          {!mapReady ? (
            <div className="h-full bg-[var(--menu-secondary)] animate-pulse" />
          ) : iframeSrc ? (
            <>
              <iframe
                title="Restaurant location map"
                src={iframeSrc}
                width="100%"
                height="100%"
                style={{ border: 0, display: "block", pointerEvents: "none" }}
                loading="lazy"
              />

              <div
                className="absolute bottom-0 inset-x-0 flex items-center justify-between gap-2 px-4 py-2"
                style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-white flex-shrink-0 opacity-80" />
                  <p className="text-[11px] text-white leading-snug truncate">{location}</p>
                </div>

                {restaurant.googleMapsLink && (
                  <a href={restaurant.googleMapsLink}
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
            <div className="h-full relative flex flex-col items-center justify-center gap-2 bg-[var(--menu-secondary)]">
              <MapPin className="w-7 h-7 text-[var(--menu-primary)] opacity-40" />
              <p className="text-xs text-[var(--menu-muted)] text-center px-10 leading-snug">
                {location}
              </p>

              {restaurant.googleMapsLink && (
                <a href={restaurant.googleMapsLink}
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

      {hasContactInfo && (
        <div className="p-4 pb-5 space-y-3">
          <h3 className="text-base font-semibold text-[var(--menu-primary)] mb-2 menu-font-display">
            Contact
          </h3>

          {phones.map((phone, index) => (
            <a key={phone} href={`tel:${phone}`} className="flex items-center gap-3 group">
              <span className="w-8 h-8 rounded-full bg-[var(--menu-secondary)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--menu-accent)]/10 transition-colors">
                <Phone className="w-3.5 h-3.5 text-[var(--menu-primary)]" />
              </span>
              <div className="min-w-0">
                {phones.length > 1 && (
                  <p className="text-[10px] text-[var(--menu-muted)] leading-none mb-0.5">
                    Line {index + 1}
                  </p>
                )}
                <span className="text-sm text-[var(--menu-foreground)]">{phone}</span>
              </div>
            </a>
          ))}

          {restaurant.emailAddress && (
            <a href={`mailto:${restaurant.emailAddress}`}
              className="flex items-center gap-3 group"
            >
              <span className="w-8 h-8 rounded-full bg-[var(--menu-secondary)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--menu-accent)]/10 transition-colors">
                <Mail className="w-3.5 h-3.5 text-[var(--menu-primary)]" />
              </span>
              <span className="text-sm text-[var(--menu-foreground)]">
                {restaurant.emailAddress}
              </span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default RestaurantInfoCard;