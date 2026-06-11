import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getErrorMessage } from "../../api/errors";
import {
  CategoriesIcon, DishesIcon, EyeIcon, HeartIcon, MenuIcon,
} from "../../assets/icons";
import PageHeader from "../../components/shared/PageHeader";
import PageErrorState from "../../components/shared/PageErrorState";
import PageLoadingState from "../../components/shared/PageLoadingState";
import Notification from "../../components/shared/Notification";
import SectionHeader from "../../components/shared/SectionHeader";
import AnalyticsLineChart from "../../components/ui/overview/AnalyticsLineChart";
import StatCard from "../../components/ui/overview/StatCard";
//import ToastContainer from "../../components/ui/ToastContainer";
import { useAuth } from "../../context/AuthContext";
//import useToast from "../../hooks/useToast";
import {
  buildMonthlyViewSeries,
  calculateViewsTrend,
  formatDisplayDate,
  formatStatNumber,
  resolveSubscriptionBanner,
} from "../../lib/analytics";
import * as restaurantService from "../../services/restaurant.service";

function OverviewPage() {
  const { restaurantId, email } = useAuth();
  //const { toasts, showToast, removeToast } = useToast();

const {
  data,
  isLoading,
  isError,
  error,
  refetch,
} = useQuery({
  queryKey: ["overview", restaurantId],
  queryFn: () => restaurantService.getDashboardStats(restaurantId!),
  enabled: !!restaurantId,
  staleTime: 1000 * 60,
});

  const subscriptionBanner = useMemo(
    () => resolveSubscriptionBanner(data?.subscriptionEndDate),
    [data?.subscriptionEndDate]
  );

  const formattedExpiryDate = formatDisplayDate(data?.subscriptionEndDate);
const restaurantName = data?.name ?? "";
  const welcomeName = restaurantName || email?.split("@")[0] || "there";

  const viewsSeries = useMemo(
    () => buildMonthlyViewSeries(data?.views ?? []),
    [data?.views]
  );

  const viewsTrend = useMemo(
    () => calculateViewsTrend(data?.views ?? []),
    [data?.views]
  );

  const likesSeries = useMemo(() => {
    const series = buildMonthlyViewSeries([]);
    const likesTotal = data?.totalLikes ?? 0;
    if (likesTotal > 0) {
      const currentMonth = series[series.length - 1];
      if (currentMonth) currentMonth.total = likesTotal;
    }
    return series;
  }, [data?.totalLikes]);

  return (
    <div className="flex flex-col min-h-full p-6 sm:p-8 lg:p-10 w-full">

      {!isLoading && !isError && subscriptionBanner === "warning" && formattedExpiryDate && (
        <Notification
          variant="warning"
          title="Subscription Expiring Soon"
          message={`Your Spectral QR Pro plan expires on ${formattedExpiryDate}. Renew your plan to keep all premium features active.`}
          className="mb-6"
        />
      )}

      {!isLoading && !isError && subscriptionBanner === "success" && formattedExpiryDate && (
        <Notification
          variant="success"
          title="Subscription Renewed Successfully"
          message={`Your Business Pro plan has been renewed successfully and will remain active until ${formattedExpiryDate}.`}
          className="mb-6"
        />
      )}

      <div className="mb-8">
        <PageHeader title="OverView" />
        <p className="text-base text-text-400 mt-1">Welcome back, {welcomeName}</p>
      </div>

      {isLoading ? (
        <PageLoadingState message="Loading overview..." />
      ) : isError ? (
        <PageErrorState
          message={getErrorMessage(error, "Could not load overview data.")}
          onRetry={refetch}
        />
      ) : (
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <SectionHeader
              icon={BarChart3}
              title="Analytics dashboard"
              description="Live stats from your restaurant account"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              <StatCard
                label="Menu"
                value={formatStatNumber(data?.totalMenus ?? 0)}
                icon={<MenuIcon className="w-5 h-5 text-primary-700" />}
                className="bg-beige-200"
              />
              <StatCard
                label="Categories"
                value={formatStatNumber(data?.totalCategories ?? 0)}
                icon={<CategoriesIcon className="w-5 h-5 text-primary-700" />}
                className="bg-beige-100"
              />
              <StatCard
                label="Dishes"
                value={formatStatNumber(data?.totalDishes ?? 0)}
                icon={<DishesIcon className="w-5 h-5 text-primary-700" />}
                className="bg-primary-100"
              />
              <StatCard
                label="Views"
                value={formatStatNumber(data?.views.length ?? 0)}
                icon={<EyeIcon className="w-5 h-5 text-primary-700" />}
                trend={viewsTrend}
                className="bg-beige-200"
              />
              <StatCard
                label="Likes"
                value={formatStatNumber(data?.totalLikes ?? 0)}
                icon={<HeartIcon className="w-5 h-5 text-primary-700" />}
                className="bg-primary-200"
              />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeader
              icon={BarChart3}
              title="Analytics Charts"
              description="Monthly activity overview"
            />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <AnalyticsLineChart
                title="Views"
                series={viewsSeries}
                primaryKey="total"
                secondaryKey="direct"
                emptyMessage="View activity will appear here once customers start visiting your menu."
              />
              <AnalyticsLineChart
                title="Likes"
                series={likesSeries}
                primaryKey="total"
                secondaryKey="qrCode"
                emptyMessage="Like activity will appear here once guests start liking dishes."
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default OverviewPage;