import { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  LayoutGrid,
  UtensilsCrossed,
  Eye,
  Heart,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import PageHeader from "../../components/shared/PageHeader";
import PageErrorState from "../../components/shared/PageErrorState";
import PageLoadingState from "../../components/shared/PageLoadingState";
import Notification from "../../components/shared/Notification";
import SectionHeader from "../../components/shared/SectionHeader";
import AnalyticsLineChart from "../../components/ui/overview/AnalyticsLineChart";
import StatCard from "../../components/ui/overview/StatCard";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/useLanguage";
import {
  buildDailyViewSeries,
  buildDailyLikesSeries,
  formatDisplayDate,
  formatStatNumber,
  resolveSubscriptionBanner,
} from "../../lib/analytics";
import * as restaurantService from "../../services/restaurant.service";
import { overviewText } from "./text/OverviewPage.text";

function OverviewPage() {
  const { restaurantId, email } = useAuth();
  const { language } = useLanguage();
  const t = overviewText[language];
  const now = new Date();

  const [viewsMonth, setViewsMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const [likesMonth, setLikesMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["overview", restaurantId],
    queryFn: () => restaurantService.getDashboardStats(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 1000 * 60,
  });

  const subscriptionBanner = useMemo(
    () => resolveSubscriptionBanner(data?.subscriptionEndDate),
    [data?.subscriptionEndDate],
  );

  const formattedExpiryDate = formatDisplayDate(data?.subscriptionEndDate);
  const restaurantName = data?.name ?? "";
  const welcomeName = restaurantName || email?.split("@")[0] || "there";

  const viewsSeries = useMemo(
    () =>
      buildDailyViewSeries(
        data?.views ?? [],
        viewsMonth.year,
        viewsMonth.month,
      ),
    [data?.views, viewsMonth],
  );

  const likesSeries = useMemo(
    () =>
      buildDailyLikesSeries(
        data?.likes ?? [],
        likesMonth.year,
        likesMonth.month,
      ),
    [data?.likes, likesMonth],
  );

  const viewsTrend = useMemo(() => {
    const views = data?.views ?? [];

    const now = new Date();
    const curY = now.getFullYear();
    const curM = now.getMonth();

    const prevDate = new Date(curY, curM - 1, 1);
    const prevY = prevDate.getFullYear();
    const prevM = prevDate.getMonth();

    let current = 0;
    let previous = 0;

    for (const v of views) {
      const d = new Date(v.viewedAt);
      if (Number.isNaN(d.getTime())) continue;

      if (d.getFullYear() === curY && d.getMonth() === curM) current++;
      else if (d.getFullYear() === prevY && d.getMonth() === prevM) previous++;
    }

    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }, [data?.views]);

  const likesTrend = useMemo(() => {
    const likes = data?.likes ?? [];

    const now = new Date();
    const curY = now.getFullYear();
    const curM = now.getMonth();

    const prevDate = new Date(curY, curM - 1, 1);
    const prevY = prevDate.getFullYear();
    const prevM = prevDate.getMonth();

    let current = 0;
    let previous = 0;

    for (const l of likes) {
      const d = new Date(l.likedAt);
      if (Number.isNaN(d.getTime())) continue;

      if (d.getFullYear() === curY && d.getMonth() === curM) current++;
      else if (d.getFullYear() === prevY && d.getMonth() === prevM) previous++;
    }

    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }, [data?.likes]);

  function prevMonth(setter: typeof setViewsMonth) {
    setter(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    );
  }

  function nextMonth(setter: typeof setViewsMonth) {
    setter(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    );
  }

  return (
    <div className="flex flex-col p-6 sm:p-8 lg:p-10 w-full">
      {!isLoading &&
        !isError &&
        subscriptionBanner === "warning" &&
        formattedExpiryDate && (
          <Notification
            variant="warning"
            title={t.subscriptionExpiringTitle}
            message={t.subscriptionExpiringMessage(formattedExpiryDate)}
            className="mb-6"
          />
        )}

      {!isLoading &&
        !isError &&
        subscriptionBanner === "success" &&
        formattedExpiryDate && (
          <Notification
            variant="success"
            title={t.subscriptionActiveTitle}
            message={t.subscriptionActiveMessage(formattedExpiryDate)}
            className="mb-6"
          />
        )}

      <div className="mb-8">
        <PageHeader title={t.pageTitle} />
        <p className="text-base text-text-400 mt-1">
          {t.welcomeBack(welcomeName)}
        </p>
      </div>

      {isLoading ? (
        <PageLoadingState message={t.loading} />
      ) : isError ? (
        <PageErrorState
          onRetry={refetch}
        />
      ) : (
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <SectionHeader
              icon={BarChart3}
              title={t.analyticsDashboardTitle}
              description={t.analyticsDashboardDescription}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              <StatCard
                label={t.menus}
                value={formatStatNumber(data?.totalMenus ?? 0)}
                icon={<BookOpen className="w-5 h-5 text-primary-700" />}
                className="bg-beige-200"
              />

              <StatCard
                label={t.categories}
                value={formatStatNumber(data?.totalCategories ?? 0)}
                icon={<LayoutGrid className="w-5 h-5 text-primary-700" />}
                className="bg-beige-100"
              />

              <StatCard
                label={t.dishes}
                value={formatStatNumber(data?.totalDishes ?? 0)}
                icon={<UtensilsCrossed className="w-5 h-5 text-primary-700" />}
                className="bg-primary-100"
              />

              <StatCard
                label={t.views}
                value={formatStatNumber(
                  data?.views?.filter((v) => {
                    const d = new Date(v.viewedAt);
                    const now = new Date();
                    return (
                      d.getFullYear() === now.getFullYear() &&
                      d.getMonth() === now.getMonth()
                    );
                  }).length ?? 0,
                )}
                icon={<Eye className="w-5 h-5 text-primary-700" />}
                trend={viewsTrend}
                className="bg-beige-200"
              />

              <StatCard
                label={t.likes}
                value={formatStatNumber(data?.totalLikes ?? 0)}
                icon={<Heart className="w-5 h-5 text-primary-700" />}
                trend={likesTrend}
                className="bg-primary-200"
              />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeader
              icon={BarChart3}
              title={t.analyticsChartsTitle}
              description={t.analyticsChartsDescription}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <AnalyticsLineChart
                title={t.views}
                series={viewsSeries}
                primaryKey="total"
                secondaryKey="direct"
                primaryDefaultVisible={true}
                secondaryDefaultVisible={false}
                showSecondaryToggle={false}
                month={viewsMonth}
                onPrev={() => prevMonth(setViewsMonth)}
                onNext={() => nextMonth(setViewsMonth)}
                emptyMessage={t.viewsEmptyMessage}
              />

              <AnalyticsLineChart
                title={t.likes}
                series={likesSeries}
                primaryKey="total"
                secondaryKey="qrCode"
                primaryDefaultVisible={true}
                secondaryDefaultVisible={false}
                showSecondaryToggle={false}
                month={likesMonth}
                onPrev={() => prevMonth(setLikesMonth)}
                onNext={() => nextMonth(setLikesMonth)}
                emptyMessage={t.likesEmptyMessage}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default OverviewPage;