import {
  Utensils,
  Car,
  Film,
  ShoppingBag,
  FileText,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "./types";

export const CATEGORY_STYLES: Record<
  Category,
  { icon: LucideIcon; color: string; bg: string; text: string; chart: string }
> = {
  Food: {
    icon: Utensils,
    color: "#f59e0b",
    bg: "bg-amber-100",
    text: "text-amber-700",
    chart: "#f59e0b",
  },
  Transportation: {
    icon: Car,
    color: "#3b82f6",
    bg: "bg-blue-100",
    text: "text-blue-700",
    chart: "#3b82f6",
  },
  Entertainment: {
    icon: Film,
    color: "#a855f7",
    bg: "bg-purple-100",
    text: "text-purple-700",
    chart: "#a855f7",
  },
  Shopping: {
    icon: ShoppingBag,
    color: "#ec4899",
    bg: "bg-pink-100",
    text: "text-pink-700",
    chart: "#ec4899",
  },
  Bills: {
    icon: FileText,
    color: "#ef4444",
    bg: "bg-red-100",
    text: "text-red-700",
    chart: "#ef4444",
  },
  Other: {
    icon: MoreHorizontal,
    color: "#6b7280",
    bg: "bg-gray-100",
    text: "text-gray-700",
    chart: "#6b7280",
  },
};
