import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";

import { getErrorMessage } from "../../api/errors";
import {
  CategoriesIcon,
  DishesIcon,
  EyeIcon,
  HeartIcon,
  MenuIcon,
} from "../../assets/icons";
import PageHeader from "../../components/shared/PageHeader";
import PageErrorState from "../../components/shared/PageErrorState";
import PageLoadingState from "../../components/shared/PageLoadingState";
import Notification from "../../components/shared/Notification";
import SectionHeader from "../../components/shared/SectionHeader";
import AnalyticsLineChart from "../../components/ui/overview/AnalyticsLineChart";
import StatCard from "../../components/ui/overview/StatCard";
import ToastContainer from "../../components/ui/ToastContainer";
import { useAuth } from "../../context/AuthContext";
import useToast from "../../hooks/useToast";
import {
  buildMonthlyViewSeries,
  calculateViewsTrend,
  formatDisplayDate,
  formatStatNumber,
  resolveSubscriptionBanner,
} from "../../lib/analytics";
import * as menuService from "../../services/menu.service";
import * as restaurantService from "../../services/restaurant.service";

function OverviewPage() {
  const { restaurantId, menuId, email } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | undefined>();
  const [totalMenus, setTotalMenus] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalDishes, setTotalDishes] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [viewsSeries, setViewsSeries] = useState(() => buildMonthlyViewSeries([]));
  const [viewsTrend, setViewsTrend] = useState<number | null>(null);

  const loadOverview = useCallback(async (signal?: { cancelled: boolean }) => {
    if (!restaurantId) {
      if (!signal?.cancelled) {
        setError("Restaurant session is missing.");
        setLoading(false);
      }
      return;
    }

    if (!signal?.cancelled) {
      setLoading(true);
      setError(null);
    }

    try {
      const requests: [
        Promise<Awaited<ReturnType<typeof restaurantService.getDashboardStats>>>,
        Promise<Awaited<ReturnType<typeof restaurantService.getRestaurant>>>,
        Promise<number>,
      ] = [
        restaurantService.getDashboardStats(restaurantId),
        restaurantService.getRestaurant(restaurantId),
        menuId
          ? menuService.getFullMenu(menuId).then(menuService.sumMenuLikes)
          : Promise.resolve(0),
      ];

      const [dashboard, restaurant, likesTotal] = await Promise.all(requests);

      if (signal?.cancelled) return;

      setRestaurantName(dashboard.name || restaurant.name);
      setSubscriptionEndDate(restaurant.subscriptionEndDate);
      setTotalMenus(dashboard.totalMenus);
      setTotalCategories(dashboard.totalCategories);
      setTotalDishes(dashboard.totalDishes);
      setTotalViews(dashboard.views.length);
      setTotalLikes(likesTotal);
      setViewsSeries(buildMonthlyViewSeries(dashboard.views));
      setViewsTrend(calculateViewsTrend(dashboard.views));
    } catch (err) {
      if (!signal?.cancelled) {
        const message = getErrorMessage(err, "Could not load overview data.");
        setError(message);
        showToast("error", "Load Failed", message);
      }
    } finally {
      if (!signal?.cancelled) setLoading(false);
    }
  }, [menuId, restaurantId, showToast]);

  useEffect(() => {
    const signal = { cancelled: false };
    loadOverview(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [loadOverview]);

  const subscriptionBanner = useMemo(
    () => resolveSubscriptionBanner(subscriptionEndDate),
    [subscriptionEndDate]
  );

  const formattedExpiryDate = formatDisplayDate(subscriptionEndDate);
  const welcomeName = restaurantName || email?.split("@")[0] || "there";

  const likesSeries = useMemo(() => {
    const series = buildMonthlyViewSeries([]);
    if (totalLikes <= 0) return series;

    const currentMonth = series[series.length - 1];
    if (currentMonth) {
      currentMonth.total = totalLikes;
    }

    return series;
  }, [totalLikes]);

  return (
    <div className="flex flex-col min-h-full p-6 sm:p-8 lg:p-10 w-full">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {!loading && !error && subscriptionBanner === "warning" && formattedExpiryDate && (
        <Notification
          variant="warning"
          title="Subscription Expiring Soon"
          message={`Your Spectral QR Pro plan expires on ${formattedExpiryDate}. Renew your plan to keep all premium features active.`}
          className="mb-6"
        />
      )}

      {!loading && !error && subscriptionBanner === "success" && formattedExpiryDate && (
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

      {loading ? (
        <PageLoadingState message="Loading overview..." />
      ) : error ? (
        <PageErrorState message={error} onRetry={() => loadOverview()} />
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
                value={formatStatNumber(totalMenus)}
                icon={<MenuIcon className="w-5 h-5 text-primary-700" />}
                className="bg-beige-200"
              />
              <StatCard
                label="Categories"
                value={formatStatNumber(totalCategories)}
                icon={<CategoriesIcon className="w-5 h-5 text-primary-700" />}
                className="bg-beige-100"
              />
              <StatCard
                label="Dishes"
                value={formatStatNumber(totalDishes)}
                icon={<DishesIcon className="w-5 h-5 text-primary-700" />}
                className="bg-primary-100"
              />
              <StatCard
                label="Views"
                value={formatStatNumber(totalViews)}
                icon={<EyeIcon className="w-5 h-5 text-primary-700" />}
                trend={viewsTrend}
                className="bg-beige-200"
              />
              <StatCard
                label="Likes"
                value={formatStatNumber(totalLikes)}
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
