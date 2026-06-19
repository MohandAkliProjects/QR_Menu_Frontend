import { useLanguage } from "../../../i18n/useLanguage";

function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-primary-700/60 shrink-0">
      <button
        onClick={() => setLanguage("en")}
        className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors duration-200
          ${language === "en"
            ? "bg-gold-600 text-primary-900"
            : "text-cream-500 hover:bg-primary-700"
          }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("fr")}
        className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors duration-200
          ${language === "fr"
            ? "bg-gold-600 text-primary-900"
            : "text-cream-500 hover:bg-primary-700"
          }`}
      >
        FR
      </button>
    </div>
  );
}

export default LanguageToggle;