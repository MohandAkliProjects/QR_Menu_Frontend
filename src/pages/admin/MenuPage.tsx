import { useState } from "react";
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
  Star,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import CreateMenuModal from "../../components/ui/menu/CreateMenuModal";
import { useAuth } from "../../context/AuthContext";
import { useMenu } from "../../context/MenuContext";
import { useLanguage } from "../../i18n/useLanguage";
import useToast from "../../hooks/useToast";
import {
  menuFormToUpdateRequest,
  menuFormToCreateRequest,
  menuResponseToForm,
  getMenuTitle,
  type MenuFormState,
} from "../../lib/mappers";
import * as menuService from "../../services/menu.service";
import { ROUTES } from "../../types/routes";
import type { Devise } from "../../types/enums";
import * as restaurantService from "../../services/restaurant.service";
import { useQuery } from "@tanstack/react-query";
import { menuText } from "./text/MenuPage.text";
import { generalText } from "./text/General.text.ts";

const DEVISE_OPTIONS: Devise[] = [
  "eur", "usd", "gbp", "dzd", "sar", "aed", "try", "cad", "chf", "cny",
];

const ALL_LANGUAGES = ["EN", "FR", "AR"] as const;
type SupportedLang = (typeof ALL_LANGUAGES)[number];

const LANGUAGE_LABELS: Record<SupportedLang, string> = {
  EN: "English", FR: "Français", AR: "العربية",
};
const LANGUAGE_PLACEHOLDERS: Record<SupportedLang, string> = {
  EN: "Menu title", FR: "Titre du menu", AR: "عنوان القائمة",
};
const LANGUAGE_FIELD: Record<SupportedLang, "english" | "french" | "arabic"> = {
  EN: "english", FR: "french", AR: "arabic",
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
    if (!form[field]?.trim()) errors[field] = t.requiredTitle(LANGUAGE_LABELS[lang]);
  }
  if (!form.devise) errors.devise = t.currencyRequired;
  return errors;
}

function MenuPage() {
  const { restaurantId } = useAuth();
  const {
    menus,
    currentMenuId,
    currentMenu,
    defaultMenuId,
    isLoading: menusLoading,
    isError: menusError,
    switchMenu,
    refetchMenus,
  } = useMenu();
  const { language } = useLanguage();
  const t = menuText[language];
  const gt = generalText[language];
  const queryClient = useQueryClient();
  const { toasts, showToast, removeToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<MenuFormState | null>(null);
  const [initialForm, setInitialForm] = useState<MenuFormState | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLang[]>([]);
  const [initialLanguages, setInitialLanguages] = useState<SupportedLang[]>([]);
  const [errors, setErrors] = useState<MenuFormErrors>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [menuPendingDelete, setMenuPendingDelete] = useState<string | null>(null);

  const { data: restaurantData } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => restaurantService.getRestaurant(restaurantId!),
    enabled: !!restaurantId,
    staleTime: Infinity,
  });

  const serverForm = currentMenu ? menuResponseToForm(currentMenu) : null;

  const derivedServerLanguages: SupportedLang[] = currentMenu
    ? (Object.keys(currentMenu.translations)
        .map((k) => k.toUpperCase())
        .filter((k): k is SupportedLang =>
          (ALL_LANGUAGES as readonly string[]).includes(k),
        ))
    : [];

  const categoryCount = currentMenu?.totalCategories ?? 0;
  const dishCount = currentMenu?.totalDishes ?? 0;

  const activeForm = isEditing ? form : serverForm;
  const activeLangs = isEditing ? supportedLanguages : derivedServerLanguages;

  const saveMutation = useMutation({
    mutationFn: (f: MenuFormState) =>
      menuService.updateMenu(
        restaurantId!,
        currentMenuId!,
        menuFormToUpdateRequest(f, supportedLanguages),
      ),
    onSuccess: () => {
      refetchMenus();
      setIsEditing(false);
      setErrors({});
      setForm(null);
      showToast("success", t.toastMenuSavedTitle, t.toastMenuSavedMessage);
    },
    onError: () => showToast("error", gt.savingErrorTitle, gt.savingError),
  });

  const createMutation = useMutation({
    mutationFn: (vars: { form: MenuFormState; langs: string[] }) =>
      menuService.createMenu(
        restaurantId!,
        menuFormToCreateRequest(vars.form, vars.langs),
      ),
    onSuccess: (created) => {
      refetchMenus();
      switchMenu(created.id);
      setShowCreateModal(false);
      showToast("success", t.toastMenuCreatedTitle, t.toastMenuCreatedMessage);
    },
    onError: (err) => showToast("error", gt.savingErrorTitle, getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (menuId: string) => menuService.deleteMenu(menuId),
    onSuccess: () => {
      setShowDeleteModal(false);
      setMenuPendingDelete(null);
      refetchMenus();
      queryClient.invalidateQueries({ queryKey: ["restaurant", restaurantId] });
      showToast("success", t.toastMenuDeletedTitle, t.toastMenuDeletedMessage);
    },
    onError: (err) => {
      showToast("error", t.toastDeleteFailedTitle, getErrorMessage(err));
    },
  });

  const handleEdit = () => {
    if (!currentMenu) return;
    setErrors({});
    setForm(serverForm);
    setSupportedLanguages(derivedServerLanguages);
    setInitialForm(serverForm);
    setInitialLanguages(derivedServerLanguages);
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
      showToast("error", t.toastValidationTitle, t.toastValidationMessage);
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

  const handleSelectMenu = (menuId: string) => {
    if (isEditing) handleCancel();
    switchMenu(menuId);
  };

  const availableToAdd = ALL_LANGUAGES.filter((l) => !activeLangs.includes(l));

  const previewUrl = restaurantData?.slug
    ? `${window.location.origin}${ROUTES.publicMenu(restaurantData.slug)}`
    : null;

  const isLoading = menusLoading;
  const isError = menusError;
  const noMenuError = !restaurantId ? t.noMenuError : null;

  const gridCols =
    activeLangs.length === 1
      ? "grid-cols-1"
      : activeLangs.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

  return (
    <div className="flex flex-col gap-6 p-6 w-full pb-10">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
        <PageHeader title={t.pageTitle} description={t.pageDescription} showDescription />

        <div className="flex items-center gap-3 flex-wrap">
          {previewUrl && (
            <Button
              label={t.preview}
              icon={ExternalLink}
              variant="secondary"
              onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}
              disabled={isLoading || isError || !currentMenu}
            />
          )}

          {!isEditing ? (
            <Button label={t.edit} icon={Edit2} onClick={handleEdit} disabled={!currentMenu} />
          ) : (
            <>
              <Button label={t.cancel} variant="secondary" onClick={handleCancel} />
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

      {noMenuError ? (
        <PageErrorState message={noMenuError} />
      ) : isLoading ? (
        <PageLoadingState message={t.loading} />
      ) : isError ? (
        <PageErrorState onRetry={refetchMenus} />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_320px] gap-6">
          {/* MENU LIST */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-dark-800">
                {t.yourMenus} ({menus.length})
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100"
                aria-label={t.createMenu}
              >
                <Plus size={15} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {menus.map((menu) => {
                const isActive = menu.id === currentMenuId;
                const isDefault = menu.id === defaultMenuId;
                return (
                  <button
                    key={menu.id}
                    onClick={() => handleSelectMenu(menu.id)}
                    className={`group flex items-center gap-2 text-left px-3 py-2.5 rounded-xl border transition-colors ${
                      isActive
                        ? "border-primary-400 bg-primary-50"
                        : "border-beige-200 bg-white hover:bg-beige-50"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-dark-800 truncate flex items-center gap-1">
                        {getMenuTitle(menu, language)}
                        {isDefault && (
                          <Star size={11} className="text-primary-600 shrink-0" />
                        )}
                      </span>
                      <span className="text-[11px] text-text-400">
                        {menu.totalCategories} {t.categories.toLowerCase()} · {menu.totalDishes}{" "}
                        {t.dishes.toLowerCase()}
                      </span>
                    </div>
                    {menus.length > 1 && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuPendingDelete(menu.id);
                          setShowDeleteModal(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 rounded-md text-text-300 hover:text-error hover:bg-error/10 shrink-0"
                      >
                        <Trash2 size={13} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {activeForm && currentMenu ? (
            <>
              {/* EDIT FORM */}
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
                            onClick={() => setSupportedLanguages((prev) => [...prev, lang])}
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
                              setErrors((prev) => ({ ...prev, [field]: undefined }));
                              setForm((prev) =>
                                prev ? { ...prev, [field]: e.target.value } : prev,
                              );
                            }}
                          />
                          {errors[field] && (
                            <span className="text-xs text-error">{errors[field]}</span>
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
                          prev ? { ...prev, devise: value.toLowerCase() as Devise } : prev,
                        );
                      }}
                    />
                    {errors.devise && (
                      <span className="text-xs text-error mt-1 block">{errors.devise}</span>
                    )}
                  </div>
                </Card>
              </div>

              {/* SUMMARY / DANGER ZONE */}
              <div className="flex flex-col gap-6">
                <Card className="flex flex-col gap-4">
                  <SectionHeader icon={LayoutList} title={t.menuSummaryTitle} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-primary-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-primary-700 mb-1">
                        <LayoutGrid className="w-4 h-4" />
                        <span className="text-sm">{t.categories}</span>
                      </div>
                      <span className="text-2xl font-semibold text-dark-800">{categoryCount}</span>
                    </div>
                    <div className="rounded-xl bg-beige-100 px-4 py-3">
                      <div className="flex items-center gap-2 text-primary-700 mb-1">
                        <UtensilsCrossed className="w-4 h-4" />
                        <span className="text-sm">{t.dishes}</span>
                      </div>
                      <span className="text-2xl font-semibold text-dark-800">{dishCount}</span>
                    </div>
                  </div>
                </Card>

                <Card className="flex flex-col gap-4">
                  <SectionHeader icon={Trash2} title={t.dangerZoneTitle} />
                  <p className="text-sm text-text-400">{t.dangerZoneDescription}</p>
                  <Button
                    label={t.deleteMenu}
                    icon={Trash2}
                    onClick={() => {
                      setMenuPendingDelete(currentMenuId);
                      setShowDeleteModal(true);
                    }}
                    disabled={menus.length <= 1}
                    className="bg-transparent! border! border-error! text-error! hover:bg-error/10!"
                  />
                  {menus.length <= 1 && (
                    <span className="text-xs text-text-400">{t.lastMenuNotice}</span>
                  )}
                </Card>
              </div>
            </>
          ) : (
            <div className="xl:col-span-2 flex items-center justify-center">
              <PageErrorState message={t.noMenuError} />
            </div>
          )}
        </div>
      )}

      <CreateMenuModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        isPending={createMutation.isPending}
        onSubmit={(f, langs) => createMutation.mutate({ form: f, langs })}
        text={{
          title: t.createModalTitle,
          titlesLabel: t.menuTitlesTitle,
          currencyLabel: t.currencyTitle,
          cancel: t.cancel,
          create: t.createMenu,
          creating: t.saving,
        }}
      />

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
              onClick={() => menuPendingDelete && deleteMutation.mutate(menuPendingDelete)}
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