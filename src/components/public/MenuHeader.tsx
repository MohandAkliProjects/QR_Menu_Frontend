import { MapPin, Phone, Mail } from "lucide-react";
import type { RestaurantInfo } from "../../types";
import type { Language } from "../../types/enums";

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "EN",
  fr: "FR",
  ar: "AR",
};

interface Props {
  restaurant: RestaurantInfo;
  menuTitle: string;
  availableLanguages: Language[];
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function MenuHeader({
  restaurant,
  menuTitle,
  availableLanguages,
  selectedLanguage,
  onLanguageChange,
}: Props) {
  const location = [restaurant.ville, restaurant.address]
    .filter((v) => v && v.trim())
    .join(", ");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {restaurant.logoUrl && (
            <img
              src={restaurant.logoUrl}
              alt={restaurant.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-gold-500 shrink-0"
            />
          )}
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl font-bold text-dark-800 leading-tight truncate">
              {restaurant.name}
            </h1>
            {menuTitle && (
              <p className="text-xs uppercase tracking-wide text-gold-600 font-medium">
                {menuTitle}
              </p>
            )}
          </div>
        </div>

        {availableLanguages.length > 1 && (
          <div className="flex items-center gap-1 bg-beige-100 rounded-xl p-1 shrink-0">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  selectedLanguage === lang
                    ? "bg-primary-700 text-white shadow-sm"
                    : "text-text-400 hover:text-dark-800"
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        )}
      </div>

      {(location || restaurant.phones?.[0] || restaurant.emailAddress) && (
        <div className="flex flex-wrap gap-3">
          {location && (
            <div className="flex items-center gap-1.5 text-xs text-text-400">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{location}</span>
            </div>
          )}
          {restaurant.phones?.[0] && (
            
            <a  href={`tel:${restaurant.phones[0]}`}
              className="flex items-center gap-1.5 text-xs text-text-400 hover:text-primary-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>{restaurant.phones[0]}</span>
            </a>
          )}
          {restaurant.emailAddress && (
            
             <a href={`mailto:${restaurant.emailAddress}`}
              className="flex items-center gap-1.5 text-xs text-text-400 hover:text-primary-700 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>{restaurant.emailAddress}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}