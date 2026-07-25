import type { ComponentType } from "react";
import ClassicMenuLayout from "./ClassicMenuLayout";
import CustomMenuLayout from "./CustomMenuLayout";
import type { MenuThemeProps } from "./types";
import EmberMenuLayout from "./ember/EmberMenuLayout";
import NoirMenuLayout from "./noir/NoirMenuLayout";

export const MENU_THEMES: Record<string, ComponentType<MenuThemeProps>> = {
  classic: ClassicMenuLayout,
  custom: CustomMenuLayout,
  ember: EmberMenuLayout,
  noir: NoirMenuLayout
};

export const DEFAULT_THEME = "classic";


export type { MenuThemeProps } from "./types";