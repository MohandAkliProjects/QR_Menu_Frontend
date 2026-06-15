import type { RestaurantInfo } from "../types/api";

interface FooterProps {
  restaurant: RestaurantInfo;
}

/** New component. Generic "powered by" footer, branded with the restaurant's logo/name. */
function Footer({ restaurant }: FooterProps) {
  return (
    <div className="px-1 py-7 border-t border-[var(--menu-border)] text-center">
      {restaurant.logoUrl ? (
        <div className="w-11 h-11 rounded-xl mx-auto mb-3 overflow-hidden border border-[var(--menu-border)] shadow-sm">
          <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center border border-[var(--menu-border)] shadow-sm bg-[var(--menu-secondary)]">
          <span className="font-bold text-sm text-[var(--menu-primary)] menu-font-display">
            {restaurant.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <p className="text-xs font-semibold text-[var(--menu-primary)] mb-0.5">{restaurant.name}</p>
      <p className="text-[10px] text-[var(--menu-muted)]">
        Powered by <span className="font-bold text-[var(--menu-accent)]">QR Menu</span>
      </p>
    </div>
  );
}

export default Footer;