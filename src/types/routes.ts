/**
 * Typed route params for React Router.
 * Use with useParams<RouteParams["PublicMenu"]>() etc.
 */

export type RouteParams = {
  /** Public QR menu — GET /api/menus/:menuId/full */
  PublicMenu: {
    menuId: string;
  };

  /** Optional: if you add restaurant-scoped public pages later */
  Restaurant: {
    restaurantId: string;
  };
};

/** All app paths in one place — avoids typos in Link/navigate */
export const ROUTES = {
  login: "/login",

  dashboard: {
    root: "/dashboard",
    overview: "/dashboard",
    categories: "/dashboard/categories",
    dishes: "/dashboard/dishes",
    information: "/dashboard/information",
    banners: "/dashboard/banners",
    qr: "/dashboard/qr",
    menuPreview: "/dashboard/menu",
  },


  qrRedirect: (restaurantId: string) => `/r/${restaurantId}` as const,
  publicMenu: (slug: string) => `/menu/${slug}` as const,
  /** Customer-facing menu (scan QR → opens this URL) */
 // publicMenu: (menuId: string) => `/menu/${menuId}` as const,
} as const;
