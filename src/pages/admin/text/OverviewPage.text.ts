export const overviewText = {
  en: {
    pageTitle: "Overview",
    welcomeBack: (name: string) => `Welcome back, ${name}`,
    subscriptionExpiringTitle: "Subscription Expiring Soon",
    subscriptionExpiringMessage: (date: string) =>
      `Your Spectral QR Pro plan expires on ${date}. Renew to keep features active.`,
    subscriptionActiveTitle: "Subscription Active",
    subscriptionActiveMessage: (date: string) =>
      `Your plan is active until ${date}.`,
    loading: "Loading overview...",
    analyticsDashboardTitle: "Analytics dashboard",
    analyticsDashboardDescription: "Live stats from your restaurant account",
    menus: "Menus",
    categories: "Categories",
    dishes: "Dishes",
    views: "Views",
    likes: "Likes",
    analyticsChartsTitle: "Analytics Charts",
    analyticsChartsDescription: "Monthly activity overview",
    viewsEmptyMessage:
      "View activity will appear here once customers start visiting your menu.",
    likesEmptyMessage:
      "Like activity will appear here once guests start liking dishes.",
  },
  fr: {
    pageTitle: "Aperçu",
    welcomeBack: (name: string) => `Bon retour, ${name}`,
    subscriptionExpiringTitle: "Abonnement bientôt expiré",
    subscriptionExpiringMessage: (date: string) =>
      `Votre abonnement Spectral QR Pro expire le ${date}. Renouvelez pour conserver les fonctionnalités actives.`,
    subscriptionActiveTitle: "Abonnement actif",
    subscriptionActiveMessage: (date: string) =>
      `Votre abonnement est actif jusqu'au ${date}.`,
    loading: "Chargement de l'aperçu...",
    analyticsDashboardTitle: "Tableau d'analyse",
    analyticsDashboardDescription:
      "Statistiques en direct de votre compte restaurant",
    menus: "Menus",
    categories: "Catégories",
    dishes: "Plats",
    views: "Vues",
    likes: "J'aime",
    analyticsChartsTitle: "Graphiques d'analyse",
    analyticsChartsDescription: "Aperçu de l'activité mensuelle",
    viewsEmptyMessage:
      "L'activité des vues apparaîtra ici dès que des clients visiteront votre menu.",
    likesEmptyMessage:
      "L'activité des j'aime apparaîtra ici dès que des clients commenceront à aimer des plats.",
  },
} as const;