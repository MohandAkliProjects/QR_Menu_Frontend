import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { FullMenuResponse, RouteParams } from "../../types";

/**
 * Customer-facing menu — opened when a guest scans the QR code.
 * URL: /menu/:menuId  →  API: GET /api/menus/:menuId/full (public, no auth)
 */
export default function PublicMenuPage() {
  const { menuId } = useParams<RouteParams["PublicMenu"]>();
  const [menu, setMenu] = useState<FullMenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!menuId) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
    fetch(`${baseUrl}/api/menus/${menuId}/full`)
      .then((res) => {
        if (!res.ok) throw new Error("Menu not found");
        return res.json() as Promise<FullMenuResponse>;
      })
      .then(setMenu)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [menuId]);

  if (loading) return <p className="p-6 text-center">Loading menu…</p>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;
  if (!menu) return null;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">
        {menu.translations.EN?.title ?? menu.translations.FR?.title ?? "Menu"}
      </h1>
      <p className="text-sm text-gray-500">{menu.categories.length} categories</p>
      {/* Build your Tailwind menu UI here using menu.categories */}
    </div>
  );
}
