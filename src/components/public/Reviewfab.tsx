import { useState } from "react";
import { MapPin, Star, X } from "lucide-react";

import type { Language } from "../../types/enums";
import type { RestaurantInfo } from "../../types/api";
import { getMenuStrings } from "../../lib/constants/menu-strings";

interface ReviewFabProps {
  restaurant: RestaurantInfo;
  language: Language;
}

export default function ReviewFab({ restaurant, language }: ReviewFabProps) {
  const t = getMenuStrings(language);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const reviewLink = restaurant.googleMapsReviewLink;
  if (!reviewLink) return null;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // clipboard not available — still open maps
    }
    window.open(reviewLink, "_blank", "noreferrer");
  };

  const handleClose = () => {
    setOpen(false);
    setText("");
    setCopied(false);
  };

  return (
    <>
      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
          onClick={handleClose}
        />
      )}

      {/* Modal — bottom-left */}
      {open && (
        <div
          className="fixed z-50 start-4 bottom-24 w-[calc(100vw-2rem)] max-w-sm rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: "var(--menu-bg)", border: "1px solid var(--menu-border)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "var(--menu-border)" }}
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold" style={{ color: "var(--menu-primary)" }}>
                {t.reviewTitle}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--menu-border)]"
              aria-label={t.close}
            >
              <X className="w-4 h-4" style={{ color: "var(--menu-muted)" }} />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4 flex flex-col gap-3">
            {/* Textarea */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.reviewPlaceholder}
              rows={4}
              className="w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
              style={{
                background: "var(--menu-card-bg, var(--menu-bg))",
                border: "1px solid var(--menu-border)",
                color: "var(--menu-primary)",
              }}
            />

            {/* Hint */}
            <p className="text-[11px] leading-snug" style={{ color: "var(--menu-muted)" }}>
              {t.reviewHint}
            </p>

            {/* CTA */}
            <button
              type="button"
              onClick={handleShare}
              disabled={!text.trim()}
              className="flex items-center justify-center gap-2.5 w-full h-12 px-4 rounded-lg text-base font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              style={{
                background: "var(--menu-accent, var(--menu-primary))",
                color: "var(--menu-on-accent, #ffffff)",
              }}
            >
              {copied ? (
                <>✓ {t.reviewCopied}</>
              ) : (
                <>
                  <MapPin size={18} />
                  {t.reviewShareButton}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* FAB button — bottom-left */}
      <div className="fixed start-4 bottom-6 z-40">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full shadow-xl px-4 h-12 font-semibold text-sm transition-transform duration-200 active:scale-90"
          style={{
            background: "var(--menu-accent, var(--menu-primary))",
            color: "var(--menu-on-accent, #ffffff)",
          }}
          aria-label={t.reviewTitle}
        >
          <Star className="w-4 h-4" style={{ fill: "var(--menu-on-accent, #ffffff)" }} />
          {t.reviewTitle}
        </button>
      </div>
    </>
  );
}