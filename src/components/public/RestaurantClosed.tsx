import { UtensilsCrossed } from "lucide-react";
import type { Language } from "../../types/enums";
import { getMenuStrings } from "../../lib/constants/menu-strings";

interface RestaurantClosedProps {
  language?: Language | null;
}

export default function RestaurantClosed({ language }: RestaurantClosedProps) {
  const t = getMenuStrings(language ?? null);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background-tertiary">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
          <UtensilsCrossed className="w-9 h-9 text-primary-700" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-dark-800">{t.closed}</h1>
          <p className="text-base text-text-400 leading-relaxed">{t.closedMessage}</p>
        </div>
      </div>
    </div>
  );
}