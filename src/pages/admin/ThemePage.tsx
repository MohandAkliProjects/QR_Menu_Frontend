import { Check, Palette } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import PageHeader from "../../components/shared/PageHeader";
import PageErrorState from "../../components/shared/PageErrorState";
import PageLoadingState from "../../components/shared/PageLoadingState";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ToastContainer from "../../components/ui/ToastContainer";
import { useAuth } from "../../context/AuthContext";
import { useMenu } from "../../context/MenuContext";
import { useLanguage } from "../../i18n/useLanguage";
import useToast from "../../hooks/useToast";
import { getErrorMessage } from "../../api/errors";
import * as themeService from "../../services/theme.service";
import { themePageText } from "./text/ThemePage.text";
import MenuFilterBar from "../../components/ui/menu/MenuFilterBar.tsx";
import { DEFAULT_THEME } from "../../components/public/themes";

function ThemePage() {
  const { restaurantId, menuId } = useAuth();
  const { menus, refetchMenus } = useMenu();
  const currentMenu = menus.find((m) => m.id === menuId) ?? null;
  const { language } = useLanguage();
  const t = themePageText[language];
  const queryClient = useQueryClient();
  const { toasts, showToast, removeToast } = useToast();

  const {
    data: themes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["themes"],
    queryFn: () => themeService.getActiveThemes(),
    staleTime: 1000 * 60 * 5,
  });

  const menusKey = ["menus", restaurantId];

  const applyThemeMutation = useMutation({
    mutationFn: (theme: string) =>
      themeService.updateMenuTheme(restaurantId!, {
        menuId: menuId!,
        theme,
      }),

    onMutate: async (theme: string) => {
      await queryClient.cancelQueries({ queryKey: menusKey });
      const previous = queryClient.getQueryData<typeof menus>(menusKey);

      queryClient.setQueryData<typeof menus>(menusKey, (old) =>
        old?.map((m) => (m.id === menuId ? { ...m, theme } : m)),
      );

      return { previous };
    },

    onError: (err, _theme, context) => {
      queryClient.setQueryData(menusKey, context?.previous);
      showToast("error", t.toastErrorTitle, getErrorMessage(err));
    },

    onSuccess: () => {
      showToast("success", t.toastSavedTitle, t.toastSavedMessage);
    },

    onSettled: () => {
      refetchMenus();
      queryClient.invalidateQueries({ queryKey: menusKey });
    },
  });

  const noMenuError = !menuId ? t.noMenuError : null;
  const effectiveTheme = currentMenu?.theme ?? DEFAULT_THEME;

  return (
    <div className="flex flex-col p-6 sm:p-8 lg:p-10 w-full">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="mb-6">
        <PageHeader
          title={t.pageTitle}
          description={t.pageDescription}
          showDescription
        />
      </div>

      <div className="mb-6">
        <MenuFilterBar />
      </div>

      {noMenuError ? (
        <PageErrorState message={noMenuError} />
      ) : isLoading ? (
        <PageLoadingState message={t.loading} />
      ) : isError ? (
        <PageErrorState onRetry={refetch} />
      ) : !themes || themes.length === 0 ? (
        <PageErrorState message={t.noThemesError} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {themes.map((theme) => {
            const isSelected = effectiveTheme === theme.key;
            const isApplying =
              applyThemeMutation.isPending &&
              applyThemeMutation.variables === theme.key;

            return (
              <Card
                key={theme.id}
                className="flex flex-col gap-4 p-0 overflow-hidden transition-shadow duration-200 hover:shadow-md"
              >
                <div className="relative aspect-4/3 sm:aspect-3/4 bg-beige-100">
                  <img
                    src={theme.imageUrl}
                    alt={theme.key}
                    className="w-full h-full object-cover"
                  />

                  {isSelected && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-gold-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      <Check size={13} />
                      {t.currentBadge}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 px-4 pb-4">
                  <div className="flex items-center gap-2 text-dark-800">
                    <Palette size={15} className="text-primary-600 shrink-0" />
                    <span className="text-sm font-medium capitalize truncate">
                      {theme.key}
                    </span>
                  </div>

                  <Button
                    label={
                      isApplying
                        ? t.applying
                        : isSelected
                          ? t.selectedButton
                          : t.selectButton
                    }
                    variant={isSelected ? "secondary" : "primary"}
                    disabled={isSelected || applyThemeMutation.isPending}
                    onClick={() => applyThemeMutation.mutate(theme.key)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThemePage;