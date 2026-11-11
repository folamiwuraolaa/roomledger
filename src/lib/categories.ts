import { Droplets, Flame, Home, ShoppingCart, Sparkles, Wifi, Zap, type LucideIcon } from "lucide-react";
import type { Category } from "./ledger";
export const CATEGORIES: Record<Category, { label: string; icon: LucideIcon }> = {
  groceries: { label: "Groceries", icon: ShoppingCart },
  electricity: { label: "Electricity", icon: Zap },
  water: { label: "Water", icon: Droplets },
  internet: { label: "Internet", icon: Wifi },
  gas: { label: "Gas", icon: Flame },
  cleaning: { label: "Cleaning", icon: Sparkles },
  household: { label: "Household", icon: Home },
};
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
