import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Heart,
  Home,
  Trophy,
  Euro,
  FileText,
  Phone,
  Dumbbell,
  Settings,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  shortLabel?: string;
};

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", shortLabel: "Home", icon: Home },
  { href: "/kalender", label: "Kalender", icon: Calendar },
  { href: "/turniere", label: "Turniere", icon: Trophy },
  {
    href: "/vitalwerte",
    label: "Gesundheit",
    shortLabel: "Gesund",
    icon: Heart,
  },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { href: "/training", label: "Training", icon: Dumbbell },
  { href: "/kosten", label: "Kosten", icon: Euro },
  { href: "/dokumente", label: "Dokumente", icon: FileText },
  { href: "/kontakte", label: "Kontakte", icon: Phone },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
];

export const ALL_NAV_ITEMS: NavItem[] = [
  ...PRIMARY_NAV_ITEMS,
  ...SECONDARY_NAV_ITEMS,
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/vitalwerte" && pathname.startsWith("/gesundheit")) {
    return true;
  }
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function getPageTitle(pathname: string): string {
  const item = ALL_NAV_ITEMS.find((nav) => isNavActive(pathname, nav.href));
  return item?.label ?? "Gino";
}

export function isSecondaryRoute(pathname: string): boolean {
  return SECONDARY_NAV_ITEMS.some((item) => isNavActive(pathname, item.href));
}
