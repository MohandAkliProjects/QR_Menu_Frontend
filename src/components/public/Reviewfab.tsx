import { Star } from "lucide-react";

import type { Language } from "../../types/enums";
import type { RestaurantInfo } from "../../types/api";
import { getMenuStrings } from "../../lib/constants/menu-strings";

interface ReviewFabProps {
  restaurant: RestaurantInfo;
  language: Language;
}

export default function ReviewFab({ restaurant, language }: ReviewFabProps) {
  const t = getMenuStrings(language);

  const reviewLink = restaurant.googleMapsReviewLink;
  if (!reviewLink) return null;

  return (
    <div className="fixed start-4 bottom-6 z-40">
      
      <a  href={reviewLink}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 rounded-full shadow-xl px-4 h-12 font-semibold text-sm transition-transform duration-200 active:scale-90"
        style={{
          background: "var(--menu-accent, var(--menu-primary))",
          color: "var(--menu-on-accent, #ffffff)",
        }}
        aria-label={t.reviewTitle}
      >
        <Star className="w-4 h-4" style={{ fill: "var(--menu-on-accent, #ffffff)" }} />
        {t.reviewTitle}
      </a>
    </div>
  );
}