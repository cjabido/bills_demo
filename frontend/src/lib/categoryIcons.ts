import {
  ShoppingBag,
  Utensils,
  Car,
  Tag,
  Tv,
  Zap,
  Home,
  ShieldCheck,
  DollarSign,
  Wifi,
  Smartphone,
  Heart,
  Activity,
  TrendingUp,
  Repeat,
  Briefcase,
  CreditCard,
  PiggyBank,
  Wallet,
  Gift,
  Music,
  Plane,
  Coffee,
  BookOpen,
  Dumbbell,
  Baby,
  Dog,
  Wrench,
  Building,
  GraduationCap,
} from 'lucide-react';
import type { ElementType } from 'react';

/** Maps lucide-react icon names (PascalCase) to their components. */
export const ICON_REGISTRY: Record<string, ElementType> = {
  ShoppingBag,
  Utensils,
  Car,
  Tag,
  Tv,
  Zap,
  Home,
  ShieldCheck,
  DollarSign,
  Wifi,
  Smartphone,
  Heart,
  Activity,
  TrendingUp,
  Repeat,
  Briefcase,
  CreditCard,
  PiggyBank,
  Wallet,
  Gift,
  Music,
  Plane,
  Coffee,
  BookOpen,
  Dumbbell,
  Baby,
  Dog,
  Wrench,
  Building,
  GraduationCap,
};

/** Look up an icon component by name, falling back to Tag. */
export function getIconComponent(name: string): ElementType {
  return ICON_REGISTRY[name] ?? Tag;
}

/** Sorted array of curated icons for rendering an icon-picker grid. */
export const CURATED_ICONS: { name: string; icon: ElementType }[] = Object.entries(ICON_REGISTRY)
  .map(([name, icon]) => ({ name, icon }))
  .sort((a, b) => a.name.localeCompare(b.name));
