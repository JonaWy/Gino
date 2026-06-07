import type { LucideIcon } from "lucide-react";
import {
  Dumbbell,
  Hammer,
  HeartPulse,
  MoreHorizontal,
  Truck,
  UserRound,
  Warehouse,
  Stethoscope,
} from "lucide-react";
import type { AppointmentType, Contact, ContactRole } from "@/types/database";

export const PERSON_CONTACT_ROLES = [
  "reiter",
  "tierarzt",
  "schmied",
  "trainer",
  "physiotherapeut",
] as const satisfies readonly ContactRole[];

export type PersonContactRole = (typeof PERSON_CONTACT_ROLES)[number];

export const OTHER_CONTACT_ROLES = [
  "stall",
  "transport",
  "sonstiges",
] as const satisfies readonly ContactRole[];

export const ALL_CONTACT_ROLES = [
  ...PERSON_CONTACT_ROLES,
  ...OTHER_CONTACT_ROLES,
] as const satisfies readonly ContactRole[];

export const CONTACTS_PAGE_SIZE = 6;

export const CONTACT_ROLE_META: Record<
  ContactRole,
  { icon: LucideIcon; accent: string; avatar: string }
> = {
  reiter: {
    icon: UserRound,
    accent: "border-l-blue-500",
    avatar: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  tierarzt: {
    icon: Stethoscope,
    accent: "border-l-red-500",
    avatar: "bg-red-500/10 text-red-700 dark:text-red-300",
  },
  schmied: {
    icon: Hammer,
    accent: "border-l-amber-600",
    avatar: "bg-amber-600/10 text-amber-800 dark:text-amber-300",
  },
  trainer: {
    icon: Dumbbell,
    accent: "border-l-emerald-500",
    avatar: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  physiotherapeut: {
    icon: HeartPulse,
    accent: "border-l-violet-500",
    avatar: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  stall: {
    icon: Warehouse,
    accent: "border-l-stone-500",
    avatar: "bg-stone-500/10 text-stone-700 dark:text-stone-300",
  },
  transport: {
    icon: Truck,
    accent: "border-l-orange-500",
    avatar: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  },
  sonstiges: {
    icon: MoreHorizontal,
    accent: "border-l-gray-400",
    avatar: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
  },
};

export function countContactsByRole(
  contacts: Contact[],
  role: ContactRole
): number {
  return contacts.filter((c) => c.role === role).length;
}

export function contactInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export const APPOINTMENT_CONTACT_ROLE: Partial<
  Record<AppointmentType, ContactRole>
> = {
  impfung: "tierarzt",
  tierarzt: "tierarzt",
  schmied: "schmied",
  training: "trainer",
  physiotherapie: "physiotherapeut",
};

export function filterContactsByRole(
  contacts: Contact[],
  role: ContactRole
): Contact[] {
  return contacts.filter((c) => c.role === role);
}

export function contactNameById(
  contacts: Contact[],
  id: string | null | undefined
): string | null {
  if (!id) return null;
  return contacts.find((c) => c.id === id)?.name ?? null;
}
