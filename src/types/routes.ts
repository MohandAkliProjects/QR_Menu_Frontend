
export type RouteParams = {
  PublicMenu: {
    slug: string;
  };

  Restaurant: {
    restaurantId: string;
  };
};

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
  publicMenu: (slug: string, menuId?: string) =>
    menuId ? (`/menu/${slug}?menu=${menuId}` as const) : (`/menu/${slug}` as const),
  menuUnavailable: "/menu-unavailable",

} as const;
