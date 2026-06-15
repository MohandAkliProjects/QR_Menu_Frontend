import type { FullMenuResponse } from "../types/api";

export function sumMenuLikes(fullMenu: FullMenuResponse): number {
  return fullMenu.categories.reduce(
    (total, category) =>
      total +
      category.dishes.reduce(
        (categoryTotal, dish) => categoryTotal + (dish.likesCount ?? 0),
        0
      ),
    0
  );
}