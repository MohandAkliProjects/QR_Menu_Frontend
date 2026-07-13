import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FloatingPanel from "./FloatingPanel";
import { useAuth } from "../../context/AuthContext";
import * as supplementService from "../../services/supplement.service";
import type { AllDishesResponse } from "../../services/dish.service";
import type { SupplementUI } from "../../types/ui";
import { supplementResponseToUI } from "../../lib/mappers";


interface DishSupplementsPopoverProps {
  dishId: string;
  attached: SupplementUI[];
  emptyLabel: string;
  noneYetLabel: string;
}

function DishSupplementsPopover({
  dishId,
  attached,
  emptyLabel,
  noneYetLabel,
}: DishSupplementsPopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { restaurantId, menuId } = useAuth();
  const queryClient = useQueryClient();
  const dishesKey = ["dishes", restaurantId];

  const { data, isLoading } = useQuery({
    queryKey: ["supplements", restaurantId, menuId],
    queryFn: () => supplementService.loadSupplementsPageData(restaurantId!, menuId!),
    enabled: open && !!restaurantId && !!menuId,
  });

  const catalog = data?.supplements ?? [];
  const attachedIds = new Set(attached.map((s) => String(s.id)));

  const addMutation = useMutation({
    mutationFn: ({ supplementId }: { supplementId: string }) =>
      supplementService.addSupplementToDish(supplementId, dishId),
    onMutate: async ({ supplementId }) => {
      await queryClient.cancelQueries({ queryKey: dishesKey });
      const previous = queryClient.getQueryData<AllDishesResponse>(dishesKey);
      const supplementToAdd = catalog.find((s) => s.id === supplementId);
      queryClient.setQueryData<AllDishesResponse>(dishesKey, (old) => {
        if (!old || !supplementToAdd) return old;
        return {
          ...old,
          menus: old.menus.map((menu) => ({
            ...menu,
            categories: menu.categories.map((cat) => ({
              ...cat,
              dishes: cat.dishes.map((d) =>
                d.id === dishId
                  ? { ...d, supplements: [...(d.supplements ?? []), supplementToAdd] }
                  : d,
              ),
            })),
          })),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData<AllDishesResponse>(dishesKey, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: dishesKey }),
  });

  const removeMutation = useMutation({
    mutationFn: ({ supplementId }: { supplementId: string }) =>
      supplementService.removeSupplementFromDish(supplementId, dishId),
    onMutate: async ({ supplementId }) => {
      await queryClient.cancelQueries({ queryKey: dishesKey });
      const previous = queryClient.getQueryData<AllDishesResponse>(dishesKey);
      queryClient.setQueryData<AllDishesResponse>(dishesKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          menus: old.menus.map((menu) => ({
            ...menu,
            categories: menu.categories.map((cat) => ({
              ...cat,
              dishes: cat.dishes.map((d) =>
                d.id === dishId
                  ? { ...d, supplements: (d.supplements ?? []).filter((s) => s.id !== supplementId) }
                  : d,
              ),
            })),
          })),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData<AllDishesResponse>(dishesKey, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: dishesKey }),
  });

  const toggle = (supplementId: string, isAttached: boolean) => {
    if (isAttached) removeMutation.mutate({ supplementId });
    else addMutation.mutate({ supplementId });
  };

  const summaryNames = attached
    .map((s) => s.english || s.french || s.arabic)
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-text-600 hover:bg-beige-100 transition-colors max-w-35"
      >
        <span className={`truncate ${attached.length === 0 ? "text-text-300" : ""}`}>
          {attached.length > 0 ? summaryNames : emptyLabel}
        </span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-text-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <FloatingPanel anchorRef={triggerRef} open={open} onClose={() => setOpen(false)} width={224}>
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <span className="text-xs text-text-400 text-center py-2">…</span>
          ) : catalog.length === 0 ? (
            <span className="text-xs text-text-400 text-center py-2">{noneYetLabel}</span>
          ) : (
            catalog.map((s) => {
              const ui = supplementResponseToUI(s);
              const name = ui.english || ui.french || ui.arabic || "—";
              const isAttached = attachedIds.has(String(s.id));
              return (
                <label
                  key={String(s.id)}
                  className="flex items-center gap-2 text-sm text-text-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isAttached}
                    onChange={() => toggle(String(s.id), isAttached)}
                    className="accent-primary-700"
                  />
                  <span className="truncate flex-1">{name}</span>
                </label>
              );
            })
          )}
        </div>
      </FloatingPanel>
    </>
  );
}

export default DishSupplementsPopover;