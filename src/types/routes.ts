
export type RouteParams = {
  PublicMenu: {
    menuId: string;
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


  //qrRedirect: (restaurantId: string) => `/r/${restaurantId}` as const,
  qrRedirect: (restaurantId: string) => `/api/restaurants/r/${restaurantId}` as const,
  publicMenu: (slug: string) => `/menu/${slug}` as const,

} as const;
