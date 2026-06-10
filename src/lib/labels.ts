import type {
  AppointmentType,
  AppointmentStatus,
  ExpenseCategory,
  ContactRole,
  DocumentType,
  HealthRecordType,
} from "@/types/database";

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  impfung: "Impfung",
  tierarzt: "Tierarzt",
  schmied: "Schmied",
  turnier: "Turnier",
  training: "Training",
  physiotherapie: "Physiotherapie",
  sonstiges: "Sonstiges",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  geplant: "Geplant",
  erledigt: "Erledigt",
  abgesagt: "Abgesagt",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  tierarzt: "Tierarzt",
  schmied: "Schmied",
  turnier: "Turnier",
  futter: "Futter",
  versicherung: "Versicherung",
  sonstiges: "Sonstiges",
};

export const CONTACT_ROLE_LABELS: Record<ContactRole, string> = {
  reiter: "Reiter",
  tierarzt: "Tierarzt",
  schmied: "Schmied",
  trainer: "Trainer",
  physiotherapeut: "Physiotherapeut",
  stall: "Stall",
  transport: "Transport",
  sonstiges: "Sonstiges",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  pferdepass: "Pferdepass",
  versicherung: "Versicherung",
  roentgen: "Röntgen",
  arztbericht: "Arztbericht",
  kaufvertrag: "Kaufvertrag",
  impfnachweis: "Impfnachweis",
  sonstiges: "Sonstiges",
};

export const HEALTH_RECORD_TYPE_LABELS: Record<HealthRecordType, string> = {
  impfung: "Impfung",
  entwurmung: "Entwurmung",
  zahnarzt: "Zahnarzt",
  sonstiges: "Sonstiges",
};

export const APPOINTMENT_TYPE_COLORS: Record<AppointmentType, string> = {
  impfung: "bg-emerald-500",
  tierarzt: "bg-red-500",
  schmied: "bg-amber-700",
  turnier: "bg-yellow-500",
  training: "bg-blue-500",
  physiotherapie: "bg-violet-500",
  sonstiges: "bg-gray-400",
};

export const COST_FORECAST_CATEGORIES: ExpenseCategory[] = [
  "tierarzt",
  "schmied",
  "turnier",
];

export const APPOINTMENT_TO_EXPENSE: Partial<
  Record<AppointmentType, ExpenseCategory>
> = {
  tierarzt: "tierarzt",
  schmied: "schmied",
  turnier: "turnier",
};

export const DEFAULT_COST_AMOUNTS: Record<string, number> = {
  tierarzt: 145,
  schmied: 80,
  turnier: 150,
};

export const HORSE_GENDERS = ["Hengst", "Stute", "Wallach"] as const;

export const TRAINING_FOCUS_OPTIONS = [
  "Dressur",
  "Springen",
  "Vielseitigkeit",
  "Western",
  "Ausritt",
  "Bodenarbeit",
  "Longieren",
  "Technik",
  "Fahren",
  "Sonstiges",
] as const;

export function horseGenderOptions(current?: string | null): string[] {
  const value = current?.trim();
  if (
    value &&
    !HORSE_GENDERS.includes(value as (typeof HORSE_GENDERS)[number])
  ) {
    return [value, ...HORSE_GENDERS];
  }
  return [...HORSE_GENDERS];
}
