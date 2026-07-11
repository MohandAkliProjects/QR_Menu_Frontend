import type { MenuResponse } from "../types/api";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Always resolved the same way regardless of the viewer's current UI
// language, so the key generated on the dashboard (QR page) and the key
// matched on the public menu page are guaranteed to agree.
function canonicalTitle(menu: MenuResponse): string {
  const translations = menu.translations ?? {};
  return (
    translations.en?.title ??
    translations.fr?.title ??
    translations.ar?.title ??
    Object.values(translations)[0]?.title ??
    menu.id
  );
}

/**
 * Builds a stable, human-readable, URL-safe key per menu (menu.id -> key).
 * Duplicate titles get "-2", "-3", etc. Sorted by id so the same menu
 * always gets the same key across renders/sessions.
 */
export function buildMenuKeyMap(menus: MenuResponse[]): Map<string, string> {
  const sorted = [...menus].sort((a, b) => a.id.localeCompare(b.id));
  const seen = new Map<string, number>();
  const keyByMenuId = new Map<string, string>();

  for (const menu of sorted) {
    const base = slugify(canonicalTitle(menu)) || "menu";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const key = count === 0 ? base : `${base}-${count + 1}`;
    keyByMenuId.set(menu.id, key);
  }

  return keyByMenuId;
}

export function findMenuByKey(
  menus: MenuResponse[],
  key: string,
): MenuResponse | undefined {
  const keyMap = buildMenuKeyMap(menus);
  const targetId = [...keyMap.entries()].find(([, k]) => k === key)?.[0];
  return menus.find((m) => m.id === targetId);
}