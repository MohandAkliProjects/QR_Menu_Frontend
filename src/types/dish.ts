import type { UniqueIdentifier } from "@dnd-kit/core";

export interface Dish {
  id: UniqueIdentifier;
  order: number;
  image: string | null;
  english: string;
  french?: string;
  arabic?: string;
  description?: string;
  price: number;
  available: "available" | "unavailable";
  status: "visible" | "hidden";
  likes: number;
  categoryId: UniqueIdentifier;
}