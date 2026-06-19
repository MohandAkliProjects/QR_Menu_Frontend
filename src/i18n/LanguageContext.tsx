import { createContext } from "react";

export type Language = "en" | "fr";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const STORAGE_KEY = "app-language";