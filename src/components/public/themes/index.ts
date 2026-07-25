import type { ComponentType } from "react";
import ClassicMenuLayout from "./ClassicMenuLayout";
import CustomMenuLayout from "./CustomMenuLayout";
import type { MenuThemeProps } from "./types";

export const MENU_THEMES: Record<string, ComponentType<MenuThemeProps>> = {
  classic: ClassicMenuLayout,
  custom: CustomMenuLayout,
};

export const DEFAULT_THEME = "classic";


export type { MenuThemeProps } from "./types";