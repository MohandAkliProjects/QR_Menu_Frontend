import { useMemo, useState } from "react";
import {
  ExternalLink,
  LayoutList,
  Save,
  Trash2,
  UtensilsCrossed,
  Plus,
  X,
  Edit2,
  LayoutGrid,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getErrorMessage } from "../../api/errors";
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
import { useLanguage } from "../../i18n/useLanguage";
import useToast from "../../hooks/useToast";
import {
  menuFormToUpdateRequest,
  menuResponseToForm,
  type MenuFormState,
} from "../../lib/mappers";
import * as menuService from "../../services/menu.service";
import { ROUTES } from "../../types/routes";
import type { Devise } from "../../types/enums";
import * as restaurantService from "../../services/restaurant.service";
import { menuText } from "./text/MenuPage.text";

const DEVISE_OPTIONS: Devise[] = [
  "eur",
  "usd",
  "gbp",
  "dzd",
  "sar",
  "aed",
  "try",
  "cad",
  "chf",
  "cny",
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

const LANGUAGE_FIELD: Record<SupportedLang, "english" | "french" | "arabic"> = {
  EN: "english",
  FR: "french",
  AR: "arabic",
};

interface MenuFormErrors {
  english?: string;
  french?: string;
  arabic?: string;
  devise?: string;
}

function validateMenuForm(
  form: MenuFormState,
  supportedLanguages: SupportedLang[],
  t: (typeof menuText)["en"],
): MenuFormErrors {
  const errors: MenuFormErrors = {};
  for (const lang of supportedLanguages) {
    const field = LANGUAGE_FIELD[lang];
    if (!form[field]?.trim()) {
      errors[field] = t.requiredTitle(LANGUAGE_LABELS[lang]);
    }
  }
  if (!form.devise) errors.devise = t.currencyRequired;
  return errors;
}

function MenuPage() {
  const { restaurantId, menuId } = useAuth();
  const { language } = useLanguage();
  const t = menuText[language];
  const queryClient = useQueryClient();
  const { toasts, showToast, removeToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<MenuFormState | null>(null);
  const [initialForm, setInitialForm] = useState<MenuFormState | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLang[]>(
    [],
  );
  const [initialLanguages, setInitialLanguages] = useState<SupportedLang[]>([]);
  const [errors, setErrors] = useState<MenuFormErrors>({});
  //const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const menuKey = ["menu", restaurantId, menuId] as const;

  const {
    data: menuData,
    isLoading: menuLoading,
    isError: menuIsError,
    error: menuError,
    refetch: refetchMenu,
  } = useQuery({
    queryKey: menuKey,
    queryFn: () => menuService.getMenuById(restaurantId!, menuId!),
    enabled: !!restaurantId && !!menuId,
    staleTime: Infinity,
  });

  const { data: restaurantData } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => restaurantService.getRestaurant(restaurantId!),
    enabled: !!restaurantId,
    staleTime: Infinity,
  });

  const serverForm = menuData ? menuResponseToForm(menuData) : null;

  const serverLanguages = useMemo<SupportedLang[]>(() => {
    if (!menuData) return [];
    return Object.keys(menuData.translations)
      .map((k) => k.toUpperCase())
      .filter((k): k is SupportedLang =>
        (ALL_LANGUAGES as readonly string[]).includes(k),
      );
  }, [menuData]);

  const categoryCount = menuData?.totalCategories ?? 0;
  const dishCount = menuData?.totalDishes ?? 0;

  const activeForm = isEditing ? form : serverForm;
  const activeLangs = isEditing ? supportedLanguages : serverLanguages;

  const saveMutation = useMutation({
    mutationFn: (f: MenuFormState) =>
      menuService.updateMenu(
        restaurantId!,
        menuId!,
        menuFormToUpdateRequest(f, supportedLanguages),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKey });
      setIsEditing(false);
      setErrors({});
      setForm(null);
      showToast("success", t.toastMenuSavedTitle, t.toastMenuSavedMessage);
    },
    onError: (err) =>
      showToast("error", t.toastSaveFailedTitle, getErrorMessage(err)),
  });

  {
    /*const deleteMutation = useMutation({
    mutationFn: () => menuService.deleteMenu(menuId!),
    onSuccess: () => {
      showToast("success", "Menu Deleted", "The menu has been deleted.");
      setShowDeleteModal(false);
      window.location.reload();
    },
    onError: (err) => showToast("error", "Delete Failed", getErrorMessage(err)),
  });*/
  }
  const deleteMutation = useMutation({
    mutationFn: () => menuService.deleteMenu(menuId!),

    onSuccess: () => {
      setShowDeleteModal(false);

      queryClient.invalidateQueries({
        queryKey: ["restaurant", restaurantId],
      });

      showToast(
        "success",
        t.toastMenuDeletedTitle,
        t.toastMenuDeletedMessage,
      );
    },

    onError: (err) => {
      showToast("error", t.toastDeleteFailedTitle, getErrorMessage(err));
    },
  });

  const handleEdit = () => {
    setErrors({});
    setForm(serverForm);
    setSupportedLanguages(serverLanguages);
    setInitialForm(serverForm);
    setInitialLanguages(serverLanguages);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setErrors({});
    setIsEditing(false);
    setForm(initialForm);
    setSupportedLanguages(initialLanguages);
  };

  const handleSave = () => {
    if (!activeForm) return;
    const validationErrors = validateMenuForm(activeForm, activeLangs, t);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      showToast(
        "error",
        t.toastValidationTitle,
        t.toastValidationMessage,
      );
      return;
    }
    saveMutation.mutate(activeForm);
  };

  const handleRemoveLanguage = (lang: SupportedLang) => {
    setSupportedLanguages((prev) => prev.filter((l) => l !== lang));
    const field = LANGUAGE_FIELD[lang];
    setForm((prev) => (prev ? { ...prev, [field]: "" } : prev));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const availableToAdd = ALL_LANGUAGES.filter((l) => !activeLangs.includes(l));

  const previewUrl = useMemo(
    () =>
      restaurantData?.slug
        ? `${window.location.origin}${ROUTES.publicMenu(restaurantData.slug)}`
        : null,
    [restaurantData],
  );

  const isLoading = menuLoading;
  const isError = menuIsError;

  const noMenuError =
    !restaurantId || !menuId ? t.noMenuError : null;

  const gridCols =
    activeLangs.length === 1
      ? "grid-cols-1"
      : activeLangs.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

  return (
    <div className="flex flex-col gap-6 p-6 w-full pb-10">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <PageHeader
          title={t.pageTitle}
          description={t.pageDescription}
          showDescription
        />

        <div className="flex items-center gap-3 flex-wrap">
          {previewUrl && (
            <Button
              label={t.preview}
              icon={ExternalLink}
              variant="secondary"
              onClick={() =>
                window.open(previewUrl, "_blank", "noopener,noreferrer")
              }
              disabled={isLoading || isError}
            />
          )}

          {!isEditing ? (
            <Button label={t.edit} icon={Edit2} onClick={handleEdit} />
          ) : (
            <>
              <Button
                label={t.cancel}
                variant="secondary"
                onClick={handleCancel}
              />
              <Button
                label={saveMutation.isPending ? t.saving : t.saveChanges}
                icon={Save}
                onClick={handleSave}
                disabled={saveMutation.isPending}
              />
            </>
          )}
        </div>
      </div>

      {!isLoading && !isError && (
        <Notification
          variant="info"
          title={t.defaultMenuTitle}
          message={t.defaultMenuMessage}
          className="mb-6"
        />
      )}

      {noMenuError ? (
        <PageErrorState message={noMenuError} />
      ) : isLoading ? (
        <PageLoadingState message={t.loading} />
      ) : isError ? (
        <PageErrorState
          message={getErrorMessage(menuError, t.loadError)}
          onRetry={refetchMenu}
        />
      ) : activeForm ? (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
          {/* LEFT */}
          <div className="flex flex-col gap-6">
            <Card className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <SectionHeader
                  icon={UtensilsCrossed}
                  title={t.menuTitlesTitle}
                  description={t.menuTitlesDescription}
                />
                {isEditing && availableToAdd.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {availableToAdd.map((lang) => (
                      <button
                        key={lang}
                        onClick={() =>
                          setSupportedLanguages((prev) => [...prev, lang])
                        }
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-primary-400 text-xs font-medium text-primary-700 hover:bg-primary-50"
                      >
                        <Plus size={13} />
                        {t.addLabel} {LANGUAGE_LABELS[lang]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={`grid ${gridCols} gap-4`}>
                {activeLangs.map((lang) => {
                  const field = LANGUAGE_FIELD[lang];
                  return (
                    <div key={lang} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-600">
                          {LANGUAGE_LABELS[lang]}
                        </label>
                        {isEditing && activeLangs.length > 1 && (
                          <button
                            onClick={() => handleRemoveLanguage(lang)}
                            className="text-text-300 hover:text-error"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <Input
                        value={activeForm[field] ?? ""}
                        disabled={!isEditing}
                        placeholder={LANGUAGE_PLACEHOLDERS[lang]}
                        dir={lang === "AR" ? "rtl" : undefined}
                        onChange={(e) => {
                          setErrors((prev) => ({
                            ...prev,
                            [field]: undefined,
                          }));
                          setForm((prev) =>
                            prev ? { ...prev, [field]: e.target.value } : prev,
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
                title={t.currencyTitle}
                description={t.currencyDescription}
              />
              <div className="max-w-50">
                <SelectDropdown
                  value={activeForm.devise.toUpperCase()}
                  options={DEVISE_OPTIONS.map((d) => d.toUpperCase())}
                  disabled={!isEditing}
                  onChange={(value) => {
                    setErrors((prev) => ({ ...prev, devise: undefined }));
                    setForm((prev) =>
                      prev
                        ? { ...prev, devise: value.toLowerCase() as Devise }
                        : prev,
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
              <SectionHeader icon={LayoutList} title={t.menuSummaryTitle} />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-primary-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-primary-700 mb-1">
                    <LayoutGrid className="w-4 h-4" />
                    <span className="text-sm">{t.categories}</span>
                  </div>
                  <span className="text-2xl font-semibold text-dark-800">
                    {categoryCount}
                  </span>
                </div>
                <div className="rounded-xl bg-beige-100 px-4 py-3">
                  <div className="flex items-center gap-2 text-primary-700 mb-1">
                    <UtensilsCrossed className="w-4 h-4" />
                    <span className="text-sm">{t.dishes}</span>
                  </div>
                  <span className="text-2xl font-semibold text-dark-800">
                    {dishCount}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="flex flex-col gap-4">
              <SectionHeader icon={Trash2} title={t.dangerZoneTitle} />
              <p className="text-sm text-text-400">
                {t.dangerZoneDescription}
              </p>
              <Button
                label={t.deleteMenu}
                icon={Trash2}
                onClick={() => setShowDeleteModal(true)}
                className="bg-transparent! border! border-error! text-error! hover:bg-error/10!"
              />
            </Card>
          </div>
        </div>
      ) : null}

      {/* <Modal
        title="Delete Menu"
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        footer={
          <div className="flex gap-4 w-full">
            <Button label="Cancel" onClick={() => setShowDeleteModal(false)} fullWidth />
            <Button
              label={deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
              icon={Trash2}
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              fullWidth
              className="bg-error! border-error!"
            />
          </div>
        }
      >
        <Notification
          variant="error"
          title="This cannot be undone"
          message="All categories, dishes, and translations will be deleted."
        />
      </Modal> */}
      <Modal
        title={t.deleteMenuModalTitle}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        isPending={deleteMutation.isPending}
        footer={
          <>
            <Button
              label={t.cancel}
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              fullWidth
            />

            <Button
              label={deleteMutation.isPending ? t.deleting : t.yesDelete}
              icon={Trash2}
              onClick={() => deleteMutation.mutate()}
              fullWidth
              className="bg-error! border-error!"
            />
          </>
        }
      >
        <Notification
          variant="error"
          title={t.deleteWarningTitle}
          message={t.deleteWarningMessage}
        />
      </Modal>
    </div>
  );
}

export default MenuPage;