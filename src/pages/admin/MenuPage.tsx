import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  LayoutList,
  Save,
  Trash2,
  UtensilsCrossed,
  Plus,
  X,
  Edit2,
} from "lucide-react";

import { getErrorMessage } from "../../api/errors";
import { CategoriesIcon, DishesIcon } from "../../assets/icons";
import PageHeader from "../../components/shared/PageHeader";
import PageErrorState from "../../components/shared/PageErrorState";
import PageLoadingState from "../../components/shared/PageLoadingState";
import Notification from "../../components/shared/Notification";
import SectionHeader from "../../components/shared/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import SelectDropdown from "../../components/ui/SelectDropdown";
import ToastContainer from "../../components/ui/ToastContainer";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import useToast from "../../hooks/useToast";
import {
  menuFormToUpdateRequest,
  menuResponseToForm,
  type MenuFormState,
} from "../../lib/mappers";
import * as menuService from "../../services/menu.service";
import type { Devise } from "../../types/enums";

// ── Constants ──────────────────────────────────────────────────────────────

const DEVISE_OPTIONS: Devise[] = [
  "eur", "usd", "gbp", "dzd", "sar",
  "aed", "try", "cad", "chf", "cny",
];

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

const LANGUAGE_FIELD: Record<
  SupportedLang,
  keyof Pick<MenuFormState, "english" | "french" | "arabic">
> = {
  EN: "english",
  FR: "french",
  AR: "arabic",
};

// ── Validation ─────────────────────────────────────────────────────────────

interface MenuFormErrors {
  english?: string;
  french?: string;
  arabic?: string;
  devise?: string;
}

function validateMenuForm(
  form: MenuFormState,
  supportedLanguages: SupportedLang[]
): MenuFormErrors {
  const errors: MenuFormErrors = {};
  for (const lang of supportedLanguages) {
    const field = LANGUAGE_FIELD[lang];
    if (!form[field]?.trim()) {
      errors[field] = `${LANGUAGE_LABELS[lang]} title is required.`;
    }
  }
  if (!form.devise) errors.devise = "Currency is required.";
  return errors;
}

// ── Component ──────────────────────────────────────────────────────────────

function MenuPage() {
  const { restaurantId, menuId } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  const [form, setForm] = useState<MenuFormState | null>(null);
  const [initialForm, setInitialForm] = useState<MenuFormState | null>(null);

  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLang[]>([]);
  const [initialLanguages, setInitialLanguages] = useState<SupportedLang[]>([]);

  const [categoryCount, setCategoryCount] = useState(0);
  const [dishCount, setDishCount] = useState(0);

  const [errors, setErrors] = useState<MenuFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  // ── Load ───────────────────────────────────────────────────────────────

  const loadMenu = useCallback(async (signal?: { cancelled: boolean }) => {
    if (!restaurantId || !menuId) {
      if (!signal?.cancelled) {
        setError("No default menu found for this restaurant.");
        setLoading(false);
      }
      return;
    }

    if (!signal?.cancelled) {
      setLoading(true);
      setError(null);
    }

    try {
      const [menu, fullMenu] = await Promise.all([
        menuService.getMenuById(restaurantId, menuId),
        menuService.getFullMenu(menuId),
      ]);

      if (signal?.cancelled) return;

      if (!menu) {
        setError("Default menu could not be loaded.");
        setForm(null);
        return;
      }

      const mappedForm = menuResponseToForm(menu);

      setForm(mappedForm);
      setInitialForm(mappedForm);

      const langs = Object.keys(menu.translations)
        .map((k) => k.toUpperCase())
        .filter(
          (k): k is SupportedLang =>
            ALL_LANGUAGES.includes(k as SupportedLang)
        );

      setSupportedLanguages(langs);
      setInitialLanguages(langs);

      setCategoryCount(fullMenu.categories.length);
      setDishCount(
        fullMenu.categories.reduce(
          (total, cat) => total + cat.dishes.length,
          0
        )
      );
    } catch (err) {
      if (!signal?.cancelled) {
        const message = getErrorMessage(err, "Could not load menu.");
        setError(message);
        showToastRef.current("error", "Load Failed", message);
      }
    } finally {
      if (!signal?.cancelled) setLoading(false);
    }
  }, [menuId, restaurantId]);

  useEffect(() => {
    const signal = { cancelled: false };
    loadMenu(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [loadMenu]);

  // ── Language management ────────────────────────────────────────────────

  const availableToAdd = ALL_LANGUAGES.filter(
    (l) => !supportedLanguages.includes(l)
  );

  const handleAddLanguage = (lang: SupportedLang) => {
    setSupportedLanguages((prev) => [...prev, lang]);
  };

  const handleRemoveLanguage = (lang: SupportedLang) => {
    setSupportedLanguages((prev) => prev.filter((l) => l !== lang));

    const field = LANGUAGE_FIELD[lang];
    setForm((prev) => (prev ? { ...prev, [field]: "" } : prev));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Save ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form || !restaurantId || !menuId) return;

    const validationErrors = validateMenuForm(form, supportedLanguages);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToast("error", "Validation Error", "Please fill in all required fields.");
      return;
    }

    setSaving(true);

    try {
      const updated = await menuService.updateMenu(
        restaurantId,
        menuId,
        menuFormToUpdateRequest(form, supportedLanguages)
      );

      const updatedForm = menuResponseToForm(updated);

      setForm(updatedForm);
      setInitialForm(updatedForm);

      const langs = Object.keys(updated.translations)
        .map((k) => k.toUpperCase())
        .filter(
          (k): k is SupportedLang =>
            ALL_LANGUAGES.includes(k as SupportedLang)
        );

      setSupportedLanguages(langs);
      setInitialLanguages(langs);

      setIsEditing(false);

      showToast("success", "Menu Saved", "Your menu has been updated.");
    } catch (err) {
      showToast("error", "Save Failed", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  

  // ── Delete ─────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!menuId) return;

    setDeleting(true);

    try {
      await menuService.deleteMenu(menuId);
      showToast("success", "Menu Deleted", "The menu has been deleted.");
      setShowDeleteModal(false);
      window.location.reload();
    } catch (err) {
      showToast("error", "Delete Failed", getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const previewUrl = useMemo(
    () => (menuId ? `/menu/${menuId}` : null),
    [menuId]
  );

  const gridCols =
    supportedLanguages.length === 1
      ? "grid-cols-1"
      : supportedLanguages.length === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 p-6 w-full pb-10">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <PageHeader
          title="Menu"
          description="Manage your restaurant default menu"
          showDescription
        />

        <div className="flex items-center gap-3 flex-wrap">
          {previewUrl && (
            <Button
              label="Preview"
              icon={ExternalLink}
              onClick={() =>
                window.open(previewUrl, "_blank", "noopener,noreferrer")
              }
              disabled={loading || Boolean(error)}
              className="!bg-transparent !border !border-primary-400 !text-primary-700 hover:!bg-primary-50"
            />
          )}

          {!isEditing ? (
            <Button
              label="Edit"
              icon={Edit2}
              onClick={() => {
                setErrors({});
                setIsEditing(true);
              }}
            />
          ) : (
            <>
              <Button
                label="Cancel"
                variant="secondary"
                onClick={() => {
                  setErrors({});
                  setIsEditing(false);

                  if (initialForm) setForm(initialForm);
                  setSupportedLanguages(initialLanguages);
                }}
              />

              <Button
                label={saving ? "Saving..." : "Save Changes"}
                icon={Save}
                onClick={handleSave}
                disabled={saving}
              />
            </>
          )}
        </div>
      </div>

      {!loading && !error && (
        <Notification
          variant="info"
          title="Default Menu"
          message="This restaurant uses one default menu. Multi-menu support will be added later."
          className="mb-6"
        />
      )}

      {loading ? (
        <PageLoadingState message="Loading menu..." />
      ) : error ? (
        <PageErrorState message={error} onRetry={() => loadMenu()} />
      ) : form ? (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">

          {/* LEFT */}
          <div className="flex flex-col gap-6">

            <Card className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <SectionHeader
                  icon={UtensilsCrossed}
                  title="Menu Titles"
                  description="One title per supported language"
                />

                {isEditing && availableToAdd.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {availableToAdd.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleAddLanguage(lang)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-primary-400 text-xs font-medium text-primary-700 hover:bg-primary-50"
                      >
                        <Plus size={13} />
                        Add {LANGUAGE_LABELS[lang]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={`grid ${gridCols} gap-4`}>
                {supportedLanguages.map((lang) => {
                  const field = LANGUAGE_FIELD[lang];

                  return (
                    <div key={lang} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-600">
                          {LANGUAGE_LABELS[lang]}
                        </label>

                        {isEditing && supportedLanguages.length > 1 && (
                          <button
                            onClick={() => handleRemoveLanguage(lang)}
                            className="text-text-300 hover:text-error"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      <Input
                        value={form[field]}
                        disabled={!isEditing}
                        placeholder={LANGUAGE_PLACEHOLDERS[lang]}
                        dir={lang === "AR" ? "rtl" : undefined}
                        onChange={(e) => {
                          setErrors((prev) => ({
                            ...prev,
                            [field]: undefined,
                          }));
                          setForm((prev) =>
                            prev ? { ...prev, [field]: e.target.value } : prev
                          );
                        }}
                      />

                      {errors[field] && (
                        <span className="text-xs text-error">
                          {errors[field]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="flex flex-col gap-4">
              <SectionHeader
                icon={UtensilsCrossed}
                title="Currency"
                description="The currency shown to customers on your public menu"
              />

              <div className="max-w-[200px]">
                <SelectDropdown
                  value={form.devise.toUpperCase()}
                  options={DEVISE_OPTIONS.map((d) => d.toUpperCase())}
                  disabled={!isEditing}
                  onChange={(value) => {
                    setErrors((prev) => ({ ...prev, devise: undefined }));
                    setForm((prev) =>
                      prev
                        ? { ...prev, devise: value.toLowerCase() as Devise }
                        : prev
                    );
                  }}
                />

                {errors.devise && (
                  <span className="text-xs text-error mt-1 block">
                    {errors.devise}
                  </span>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-6">

            <Card className="flex flex-col gap-4">
              <SectionHeader icon={LayoutList} title="Menu Summary" />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-primary-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-primary-700 mb-1">
                    <CategoriesIcon className="w-4 h-4" />
                    <span className="text-sm">Categories</span>
                  </div>
                  <span className="text-2xl font-semibold text-dark-800">
                    {categoryCount}
                  </span>
                </div>

                <div className="rounded-xl bg-beige-100 px-4 py-3">
                  <div className="flex items-center gap-2 text-primary-700 mb-1">
                    <DishesIcon className="w-4 h-4" />
                    <span className="text-sm">Dishes</span>
                  </div>
                  <span className="text-2xl font-semibold text-dark-800">
                    {dishCount}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="flex flex-col gap-4">
              <SectionHeader icon={Trash2} title="Danger Zone" />
              <p className="text-sm text-text-400">
                Deleting this menu will permanently remove all categories and
                dishes associated with it.
              </p>

              <Button
                label="Delete Menu"
                icon={Trash2}
                onClick={() => setShowDeleteModal(true)}
                className="!bg-transparent !border !border-error !text-error hover:!bg-error/10"
              />
            </Card>
          </div>
        </div>
      ) : null}

      <Modal
        title="Delete Menu"
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        footer={
          <div className="flex gap-4 w-full">
            <Button
              label="Cancel"
              onClick={() => setShowDeleteModal(false)}
              fullWidth
            />
            <Button
              label={deleting ? "Deleting..." : "Yes, Delete"}
              icon={Trash2}
              onClick={handleDeleteConfirm}
              disabled={deleting}
              fullWidth
              className="!bg-error !border-error"
            />
          </div>
        }
      >
        <Notification
          variant="error"
          title="This cannot be undone"
          message="All categories, dishes, and translations will be deleted."
        />
      </Modal>
    </div>
  );
}

export default MenuPage;