import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import { de } from "date-fns/locale";
import type { Appointment, Expense, ExpenseCategory } from "@/types/database";
import { COST_FORECAST_CATEGORIES } from "@/lib/labels";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatMonthLabel(date: Date): string {
  return format(date, "MMMM yyyy", { locale: de });
}

export function computeCategoryAverage(
  expenses: Expense[],
  category: ExpenseCategory,
  months = 12
): number | null {
  const cutoff = addMonths(new Date(), -months);
  const filtered = expenses.filter(
    (e) =>
      e.category === category &&
      !e.is_estimated &&
      parseISO(e.date) >= cutoff
  );
  if (filtered.length === 0) return null;
  const sum = filtered.reduce((acc, e) => acc + Number(e.amount), 0);
  return Math.round((sum / filtered.length) * 100) / 100;
}

export function getSuggestedCost(
  category: ExpenseCategory,
  expenses: Expense[],
  defaults: Record<string, number>
): number {
  const avg = computeCategoryAverage(expenses, category);
  if (avg !== null) return avg;
  return defaults[category] ?? 0;
}

export interface MonthCostSummary {
  month: string;
  monthLabel: string;
  isFuture: boolean;
  tierarzt: number;
  schmied: number;
  turnier: number;
  total: number;
}

export function computeMonthSummaries(
  appointments: Appointment[],
  expenses: Expense[],
  monthsBack = 6,
  monthsForward = 6
): MonthCostSummary[] {
  const now = new Date();
  const summaries: MonthCostSummary[] = [];

  for (let i = -monthsBack; i <= monthsForward; i++) {
    const monthDate = addMonths(startOfMonth(now), i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const isFuture = isAfter(monthStart, now);

    const cats: Record<string, number> = {
      tierarzt: 0,
      schmied: 0,
      turnier: 0,
    };

    if (isFuture) {
      appointments
        .filter(
          (a) =>
            a.status === "geplant" &&
            parseISO(a.starts_at) >= monthStart &&
            parseISO(a.starts_at) <= monthEnd &&
            a.estimated_cost
        )
        .forEach((a) => {
          const key = a.type === "tierarzt" || a.type === "schmied" || a.type === "turnier" ? a.type : null;
          if (key) cats[key] += Number(a.estimated_cost);
        });
    } else {
      expenses
        .filter(
          (e) =>
            !e.is_estimated &&
            parseISO(e.date) >= monthStart &&
            parseISO(e.date) <= monthEnd &&
            COST_FORECAST_CATEGORIES.includes(e.category)
        )
        .forEach((e) => {
          cats[e.category] += Number(e.amount);
        });

      appointments
        .filter(
          (a) =>
            a.status === "erledigt" &&
            a.actual_cost &&
            parseISO(a.starts_at) >= monthStart &&
            parseISO(a.starts_at) <= monthEnd
        )
        .forEach((a) => {
          const key = a.type === "tierarzt" || a.type === "schmied" || a.type === "turnier" ? a.type : null;
          if (key && cats[key] === 0) cats[key] += Number(a.actual_cost);
        });
    }

    summaries.push({
      month: format(monthDate, "yyyy-MM"),
      monthLabel: formatMonthLabel(monthDate),
      isFuture,
      tierarzt: cats.tierarzt,
      schmied: cats.schmied,
      turnier: cats.turnier,
      total: cats.tierarzt + cats.schmied + cats.turnier,
    });
  }

  return summaries;
}

export interface CategoryStats {
  category: ExpenseCategory;
  average: number;
  count: number;
  min: number;
  max: number;
  total: number;
}

export function computeCategoryStats(
  expenses: Expense[]
): CategoryStats[] {
  return COST_FORECAST_CATEGORIES.map((category) => {
    const filtered = expenses.filter(
      (e) => e.category === category && !e.is_estimated
    );
    const amounts = filtered.map((e) => Number(e.amount));
    const total = amounts.reduce((a, b) => a + b, 0);
    return {
      category,
      average: amounts.length ? Math.round((total / amounts.length) * 100) / 100 : 0,
      count: amounts.length,
      min: amounts.length ? Math.min(...amounts) : 0,
      max: amounts.length ? Math.max(...amounts) : 0,
      total,
    };
  });
}

export function daysUntil(dateStr: string): number {
  const target = parseISO(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function computeHorseAge(birthDate: string | null): string | null {
  if (!birthDate) return null;
  const birth = parseISO(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
  return `${years} Jahre`;
}

export function getCurrentMonthForecast(
  appointments: Appointment[]
): number {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  return appointments
    .filter(
      (a) =>
        a.status === "geplant" &&
        a.estimated_cost &&
        parseISO(a.starts_at) >= monthStart &&
        (isBefore(parseISO(a.starts_at), monthEnd) ||
          parseISO(a.starts_at).getTime() === monthEnd.getTime())
    )
    .reduce((sum, a) => sum + Number(a.estimated_cost), 0);
}
