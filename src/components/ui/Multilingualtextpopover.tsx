import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import FloatingPanel from "./FloatingPanel";
import type { LanguageConfig } from "./category/CategoryRow";


export type MultilingualLang = "en" | "fr" | "ar";

interface MultilingualTextPopoverProps {
  englishText?: string | null;
  frenchText?: string | null;
  arabicText?: string | null;
  languages: LanguageConfig;
  emptyLabel?: string;
  triggerMaxWidthClassName?: string;
  panelWidth?: number;
}

export function MultilingualTextPopover({
  englishText,
  frenchText,
  arabicText,
  languages,
  emptyLabel = "—",
  triggerMaxWidthClassName = "max-w-35",
  panelWidth = 256,
}: MultilingualTextPopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const hasAny = englishText || frenchText || arabicText;

  if (!hasAny) return <span className="text-sm text-text-300 select-none">{emptyLabel}</span>;

  const entries = [
    languages.showEnglish && englishText && { label: "EN", text: englishText, dir: "ltr" as const },
    languages.showFrench && frenchText && { label: "FR", text: frenchText, dir: "ltr" as const },
    languages.showArabic && arabicText && { label: "AR", text: arabicText, dir: "rtl" as const },
  ].filter(Boolean) as { label: string; text: string; dir: "ltr" | "rtl" }[];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-text-600 hover:bg-beige-100 transition-colors ${triggerMaxWidthClassName}`}
      >
        <span className="truncate">{englishText || frenchText || arabicText}</span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-text-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <FloatingPanel anchorRef={triggerRef} open={open} onClose={() => setOpen(false)} width={panelWidth}>
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <div key={entry.label} className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold tracking-widest uppercase text-text-400">
                {entry.label}
              </span>
              <p dir={entry.dir} className="text-sm text-text-700 leading-relaxed wrap-break-words">
                {entry.text}
              </p>
            </div>
          ))}
        </div>
      </FloatingPanel>
    </>
  );
}

interface MultilingualTextEditorProps {
  englishText?: string | null;
  frenchText?: string | null;
  arabicText?: string | null;
  onChange: (lang: MultilingualLang, value: string) => void;
  languages: LanguageConfig;
  englishPlaceholder?: string;
  frenchPlaceholder?: string;
  arabicPlaceholder?: string;
}

export function MultilingualTextEditor({
  englishText,
  frenchText,
  arabicText,
  onChange,
  languages,
  englishPlaceholder = "Description…",
  frenchPlaceholder = "Description…",
  arabicPlaceholder = "وصف…",
}: MultilingualTextEditorProps) {
  const tabs = [
    languages.showEnglish && {
      key: "en" as const,
      label: "EN",
      value: englishText ?? "",
      dir: "ltr" as const,
      placeholder: englishPlaceholder,
    },
    languages.showFrench && {
      key: "fr" as const,
      label: "FR",
      value: frenchText ?? "",
      dir: "ltr" as const,
      placeholder: frenchPlaceholder,
    },
    languages.showArabic && {
      key: "ar" as const,
      label: "AR",
      value: arabicText ?? "",
      dir: "rtl" as const,
      placeholder: arabicPlaceholder,
    },
  ].filter(Boolean) as {
    key: MultilingualLang;
    label: string;
    value: string;
    dir: "ltr" | "rtl";
    placeholder: string;
  }[];

  const [activeTab, setActiveTab] = useState<MultilingualLang>(tabs[0]?.key ?? "en");
  const active = tabs.find((tab) => tab.key === activeTab);

  if (!tabs.length) return null;

  return (
    <div className="flex flex-col gap-1 w-full">
      {tabs.length > 1 && (
        <div className="flex rounded-md border border-beige-300 overflow-hidden self-start">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-2 py-0.5 text-[10px] font-semibold transition-colors
                ${activeTab === tab.key ? "bg-primary-700 text-cream-500" : "bg-card-bg text-text-500 hover:bg-beige-100"}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      {active && (
        <textarea
          key={active.key}
          value={active.value}
          placeholder={active.placeholder}
          dir={active.dir}
          onChange={(e) => onChange(active.key, e.target.value)}
          rows={2}
          className="
            w-full px-3 py-2 rounded-lg border border-beige-400
            text-sm text-dark-700 bg-cream-200
            focus:outline-none focus:border-primary-500
            resize-none overflow-y-auto max-h-20
          "
        />
      )}
    </div>
  );
}