import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import PageHeader from "../../components/shared/PageHeader";
import PageErrorState from "../../components/shared/PageErrorState";
import PageLoadingState from "../../components/shared/PageLoadingState";
import Notification from "../../components/shared/Notification";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import Table from "../../components/ui/table/Table";
import type { Column } from "../../components/ui/table/Table";
import SupplementRow from "../../components/ui/supplement/SupplementRow.tsx";
import AddSupplementModal from "../../components/ui/supplement/AddSupplementModal.tsx";
import ToastContainer from "../../components/ui/ToastContainer";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/useLanguage";
import useToast from "../../hooks/useToast";
import { supplementResponseToUI } from "../../lib/mappers";
import * as supplementService from "../../services/supplement.service";
import type { Language } from "../../types/enums";
import type { SupplementUI as Supplement } from "../../types/ui.ts";
import { supplementsText } from "./text/SupplementsPage.text.ts";
import MenuFilterBar from "../../components/ui/menu/MenuFilterBar.tsx";

const ITEMS_PER_PAGE = 1000;

function SupplementsPage() {
  const { menuId, restaurantId } = useAuth();
  const queryClient = useQueryClient();
  const { toasts, showToast, removeToast } = useToast();
  const { language } = useLanguage();
  const t = supplementsText[language];
  void queryClient;
  void showToast;

  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const supplementsKey = ["supplements", restaurantId, menuId];

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: supplementsKey,
    queryFn: () =>
      supplementService.loadSupplementsPageData(restaurantId!, menuId!),
    enabled: !!menuId && !!restaurantId,
  });

  const supplements: Supplement[] =
    data?.supplements.map(supplementResponseToUI) ?? [];

  const supportedLanguages: Language[] = data?.supportedLanguages ?? [];

  const languages = {
    showEnglish: supportedLanguages.includes("EN" as Language),
    showFrench: supportedLanguages.includes("FR" as Language),
    showArabic: supportedLanguages.includes("AR" as Language),
  };

  const supplementsWithMissing = supplements.filter((s) => {
    if (languages.showEnglish && !s.english) return true;
    if (languages.showFrench && !s.french) return true;
    if (languages.showArabic && !s.arabic) return true;
    return false;
  });

  const totalPages = Math.max(1, Math.ceil(supplements.length / ITEMS_PER_PAGE));
  const paginatedSupplements = supplements;

  const columns: Column[] = [
    {
      key: "english",
      label: t.colEnglish,
      center: true,
      width: "min-w-[140px]",
      hidden: !languages.showEnglish,
    },
    {
      key: "french",
      label: t.colFrench,
      center: true,
      width: "min-w-[140px]",
      hidden: !languages.showFrench,
    },
    {
      key: "arabic",
      label: t.colArabic,
      center: true,
      width: "min-w-[140px]",
      hidden: !languages.showArabic,
    },
    { key: "price", label: t.colPrice, center: true, width: "min-w-[100px]" },
    { key: "available", label: t.colAvailable, center: true, width: "min-w-[120px]" },
    { key: "status", label: t.colStatus, center: true, width: "min-w-[120px]" },
    { key: "actions", label: t.colActions, center: true, width: "min-w-[140px]" },
  ];

  const noMenuError = !menuId || !restaurantId ? t.noMenuError : null;

  return (
    <div className="flex flex-col p-6 sm:p-8 lg:p-10 w-full">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <PageHeader
          title={t.pageTitle}
          description={t.pageDescription}
          showDescription
        />
        <Button
          label={t.addSupplement}
          icon={Plus}
          onClick={() => setModalOpen(true)}
          disabled={isLoading || isError || !!noMenuError}
        />
      </div>

      {!isLoading &&
        !isError &&
        !noMenuError &&
        supplementsWithMissing.length > 0 && (
          <Notification
            variant="warning"
            title={t.missingTranslationsTitle}
            message={`${supplementsWithMissing.length} ${
              supplementsWithMissing.length > 1
                ? t.missingTranslationsPlural
                : t.missingTranslationsSingle
            }`}
            className="mb-6"
          />
        )}

      {noMenuError ? (
        <PageErrorState message={noMenuError} />
      ) : isLoading ? (
        <PageLoadingState message={t.loading} />
      ) : isError ? (
        <PageErrorState onRetry={refetch} />
      ) : (
        <>
        
        <div className="mb-4">
  <MenuFilterBar />
</div>
          <div className="flex-1">
            <Table columns={columns}>
              {paginatedSupplements.map((supplement, index) => (
                <SupplementRow
                  key={supplement.id}
                  supplement={supplement}
                  isFirst={index === 0}
                  isLast={index === paginatedSupplements.length - 1}
                  languages={languages}
                />
              ))}
            </Table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <AddSupplementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setCurrentPage(1)}
        supportedLanguages={supportedLanguages}
      />
    </div>
  );
}

export default SupplementsPage;