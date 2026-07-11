import { useState } from "react";
import { Plus, X } from "lucide-react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import SelectDropdown from "../../ui/SelectDropdown";
import type { Devise } from "../../../types/enums";
import type { MenuFormState } from "../../../lib/mappers";

const ALL_LANGUAGES = ["EN", "FR", "AR"] as const;
type SupportedLang = (typeof ALL_LANGUAGES)[number];

const LANGUAGE_LABELS: Record<SupportedLang, string> = {
  EN: "English",
  FR: "Français",
  AR: "العربية",
};
const LANGUAGE_PLACEHOLDERS: Record<SupportedLang, string> = {
  EN: "Menu title",
  FR: "Titre du menu",
  AR: "عنوان القائمة",
};
const LANGUAGE_FIELD: Record<SupportedLang, "english" | "french" | "arabic"> = {
  EN: "english",
  FR: "french",
  AR: "arabic",
};

const DEVISE_OPTIONS: Devise[] = [
  "eur", "usd", "gbp", "dzd", "sar", "aed", "try", "cad", "chf", "cny",
];

interface CreateMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: MenuFormState, supportedLanguages: SupportedLang[]) => void;
  isPending?: boolean;
  text: {
    title: string;
    titlesLabel: string;
    currencyLabel: string;
    cancel: string;
    create: string;
    creating: string;
  };
}

export default function CreateMenuModal({
  isOpen,
  onClose,
  onSubmit,
  isPending=false,
  text,
}: CreateMenuModalProps) {
  const [langs, setLangs] = useState<SupportedLang[]>(["EN"]);
  const [form, setForm] = useState<MenuFormState>({
    english: "",
    french: "",
    arabic: "",
    devise: "dzd",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const availableToAdd = ALL_LANGUAGES.filter((l) => !langs.includes(l));

  const handleAddLang = (lang: SupportedLang) => setLangs((p) => [...p, lang]);
  const handleRemoveLang = (lang: SupportedLang) => {
    if (langs.length === 1) return;
    setLangs((p) => p.filter((l) => l !== lang));
    setForm((p) => ({ ...p, [LANGUAGE_FIELD[lang]]: "" }));
  };

  const resetAndClose = () => {
    setLangs(["EN"]);
    setForm({ english: "", french: "", arabic: "", devise: "dzd" });
    setErrors({});
    onClose();
  };

  const handleSubmit = () => {
    const nextErrors: Record<string, string | undefined> = {};
    for (const lang of langs) {
      const field = LANGUAGE_FIELD[lang];
      if (!form[field]?.trim())
        nextErrors[field] = `${LANGUAGE_LABELS[lang]} title is required.`;
    }
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    onSubmit(form, langs);
  };

  return (
    <Modal
      title={text.title}
      isOpen={isOpen}
      onClose={resetAndClose}
      isPending={isPending}
      footer={
        <>
          <Button label={text.cancel} variant="secondary" onClick={resetAndClose} fullWidth />
          <Button
            label={isPending ? text.creating : text.create}
            icon={Plus}
            onClick={handleSubmit}
            disabled={isPending}
            fullWidth
          />
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-medium text-text-600">{text.titlesLabel}</span>
            {availableToAdd.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {availableToAdd.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleAddLang(lang)}
                    className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-dashed border-primary-400 text-xs font-medium text-primary-700 hover:bg-primary-50"
                  >
                    <Plus size={12} />
                    {LANGUAGE_LABELS[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {langs.map((lang) => {
            const field = LANGUAGE_FIELD[lang];
            return (
              <div key={lang} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-text-400">{LANGUAGE_LABELS[lang]}</label>
                  {langs.length > 1 && (
                    <button
                      onClick={() => handleRemoveLang(lang)}
                      className="text-text-300 hover:text-error"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <Input
                  value={form[field] ?? ""}
                  placeholder={LANGUAGE_PLACEHOLDERS[lang]}
                  dir={lang === "AR" ? "rtl" : undefined}
                  onChange={(e) => {
                    setErrors((p) => ({ ...p, [field]: undefined }));
                    setForm((p) => ({ ...p, [field]: e.target.value }));
                  }}
                />
                {errors[field] && (
                  <span className="text-xs text-error">{errors[field]}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5 max-w-50">
          <label className="text-sm font-medium text-text-600">{text.currencyLabel}</label>
          <SelectDropdown
            value={form.devise.toUpperCase()}
            options={DEVISE_OPTIONS.map((d) => d.toUpperCase())}
            onChange={(value) =>
              setForm((p) => ({ ...p, devise: value.toLowerCase() as Devise }))
            }
          />
        </div>
      </div>
    </Modal>
  );
}