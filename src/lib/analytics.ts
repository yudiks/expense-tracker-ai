import type { Category, Expense } from "./types";
import { monthKey } from "./utils";

export interface MonthlyTotal {
  month: string; // YYYY-MM
  total: number;
}

export interface MonthOverMonthChange {
  currentMonth: string | null;
  previousMonth: string | null;
  currentTotal: number;
  previousTotal: number;
  absoluteChange: number;
  percentChange: number | null; // null when previous total is 0 (division by zero)
}

export interface CategoryShare {
  category: Category;
  total: number;
  share: number; // 0-1
}

export interface VendorShare {
  vendor: string;
  total: number;
  count: number;
  share: number; // 0-1
}

export interface CategoryComparison {
  category: Category;
  current: number;
  previous: number;
  absoluteChange: number;
  percentChange: number | null;
}

export type TrendDirection = "up" | "down" | "flat";

export interface SpendingTrend {
  direction: TrendDirection;
  averageChange: number;
  monthsConsidered: number;
}

export interface AverageSpend {
  daily: number;
  weekly: number;
  monthly: number;
}

/**
 * Returns the totals for each distinct month present in the expenses, sorted
 * chronologically ascending.
 */
export function getMonthlyTotals(expenses: Expense[]): MonthlyTotal[] {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    const key = monthKey(expense.date);
    totals.set(key, (totals.get(key) ?? 0) + expense.amount);
  }
  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));
}

/**
 * Compares the most recent month of spending to the prior month.
 * If fewer than two months of data exist, the missing month(s) default to 0.
 */
export function getMonthOverMonthChange(expenses: Expense[]): MonthOverMonthChange {
  const totals = getMonthlyTotals(expenses);

  if (totals.length === 0) {
    return {
      currentMonth: null,
      previousMonth: null,
      currentTotal: 0,
      previousTotal: 0,
      absoluteChange: 0,
      percentChange: null,
    };
  }

  const current = totals[totals.length - 1];
  const previous = totals.length > 1 ? totals[totals.length - 2] : null;

  const currentTotal = current.total;
  const previousTotal = previous?.total ?? 0;
  const absoluteChange = currentTotal - previousTotal;
  const percentChange = previousTotal === 0 ? null : (absoluteChange / previousTotal) * 100;

  return {
    currentMonth: current.month,
    previousMonth: previous?.month ?? null,
    currentTotal,
    previousTotal,
    absoluteChange,
    percentChange,
  };
}

/**
 * Returns categories ranked by total spend with each category's share of the
 * overall total. If there's no spending, an empty array is returned.
 */
export function getTopCategories(expenses: Expense[], limit?: number): CategoryShare[] {
  const totals = new Map<Category, number>();
  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }

  const grandTotal = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);

  const ranked = Array.from(totals.entries())
    .map(([category, total]) => ({
      category,
      total,
      share: grandTotal === 0 ? 0 : total / grandTotal,
    }))
    .sort((a, b) => b.total - a.total);

  return limit ? ranked.slice(0, limit) : ranked;
}

/**
 * Returns vendors (derived from each expense's `description`, trimmed and
 * normalized for case) ranked by total spend, along with the number of
 * transactions and each vendor's share of the overall total. The displayed
 * vendor name uses the original casing from the most recently created
 * matching expense. If there's no spending, an empty array is returned.
 */
export function getTopVendors(expenses: Expense[], limit?: number): VendorShare[] {
  const totals = new Map<string, number>();
  const counts = new Map<string, number>();
  const displayNames = new Map<string, { name: string; createdAt: number }>();

  for (const expense of expenses) {
    const key = expense.description.trim().toLowerCase();
    if (!key) continue;

    totals.set(key, (totals.get(key) ?? 0) + expense.amount);
    counts.set(key, (counts.get(key) ?? 0) + 1);

    const existing = displayNames.get(key);
    if (!existing || expense.createdAt > existing.createdAt) {
      displayNames.set(key, { name: expense.description.trim(), createdAt: expense.createdAt });
    }
  }

  const grandTotal = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);

  const ranked = Array.from(totals.entries())
    .map(([key, total]) => ({
      vendor: displayNames.get(key)?.name ?? key,
      total,
      count: counts.get(key) ?? 0,
      share: grandTotal === 0 ? 0 : total / grandTotal,
    }))
    .sort((a, b) => b.total - a.total);

  return limit ? ranked.slice(0, limit) : ranked;
}

/**
 * Computes average daily, weekly, and monthly spend across the full date
 * range covered by the expenses (inclusive of the first and last day).
 */
export function getAverageSpend(expenses: Expense[]): AverageSpend {
  if (expenses.length === 0) {
    return { daily: 0, weekly: 0, monthly: 0 };
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const dates = expenses.map((e) => e.date).sort();
  const first = new Date(dates[0]);
  const last = new Date(dates[dates.length - 1]);

  const dayMs = 24 * 60 * 60 * 1000;
  const daySpan = Math.max(1, Math.round((last.getTime() - first.getTime()) / dayMs) + 1);

  const daily = total / daySpan;
  const weekly = daily * 7;
  const monthly = daily * 30;

  return { daily, weekly, monthly };
}

/**
 * Determines whether spending has been trending up, down, or flat over the
 * most recent months by looking at month-over-month changes.
 *
 * `flat` is returned when there's insufficient data (fewer than 2 months) or
 * when the average change is within `flatThreshold` percent of the prior
 * month's total.
 */
export function getSpendingTrend(
  expenses: Expense[],
  monthsToConsider = 3,
  flatThresholdPercent = 5
): SpendingTrend {
  const totals = getMonthlyTotals(expenses);

  if (totals.length < 2) {
    return { direction: "flat", averageChange: 0, monthsConsidered: 0 };
  }

  const recent = totals.slice(-monthsToConsider);
  const changes: number[] = [];

  for (let i = 1; i < recent.length; i++) {
    changes.push(recent[i].total - recent[i - 1].total);
  }

  const averageChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;

  const referenceTotal = recent[recent.length - 2].total;
  const thresholdAmount =
    referenceTotal === 0 ? 0 : Math.abs(referenceTotal) * (flatThresholdPercent / 100);

  let direction: TrendDirection = "flat";
  if (Math.abs(averageChange) > thresholdAmount && thresholdAmount >= 0) {
    if (averageChange > thresholdAmount) direction = "up";
    else if (averageChange < -thresholdAmount) direction = "down";
  }
  // Special case: if reference total is 0 but average change is positive, that's an increase.
  if (referenceTotal === 0 && averageChange > 0) {
    direction = "up";
  }

  return { direction, averageChange, monthsConsidered: changes.length };
}

/**
 * Returns the `limit` largest single expenses, sorted descending by amount.
 */
export function getLargestExpenses(expenses: Expense[], limit = 5): Expense[] {
  return [...expenses].sort((a, b) => b.amount - a.amount).slice(0, limit);
}

/**
 * Compares per-category spend between the current month and the previous
 * month, returning the absolute and percent change for each category that
 * appears in either month.
 */
export function getCategoryComparison(expenses: Expense[]): CategoryComparison[] {
  const totals = getMonthlyTotals(expenses);

  if (totals.length === 0) {
    return [];
  }

  const currentMonth = totals[totals.length - 1].month;
  const previousMonth = totals.length > 1 ? totals[totals.length - 2].month : null;

  const currentByCategory = new Map<Category, number>();
  const previousByCategory = new Map<Category, number>();

  for (const expense of expenses) {
    const key = monthKey(expense.date);
    if (key === currentMonth) {
      currentByCategory.set(expense.category, (currentByCategory.get(expense.category) ?? 0) + expense.amount);
    } else if (previousMonth && key === previousMonth) {
      previousByCategory.set(expense.category, (previousByCategory.get(expense.category) ?? 0) + expense.amount);
    }
  }

  const categories = new Set<Category>();
  currentByCategory.forEach((_value, category) => categories.add(category));
  previousByCategory.forEach((_value, category) => categories.add(category));

  return Array.from(categories)
    .map((category) => {
      const current = currentByCategory.get(category) ?? 0;
      const previous = previousByCategory.get(category) ?? 0;
      const absoluteChange = current - previous;
      const percentChange = previous === 0 ? null : (absoluteChange / previous) * 100;
      return { category, current, previous, absoluteChange, percentChange };
    })
    .sort((a, b) => b.current - a.current);
}

/**
 * Finds the category with the largest absolute month-over-month increase.
 * Returns null if there is fewer than two months of data or no increase.
 */
export function getBiggestCategoryJump(expenses: Expense[]): CategoryComparison | null {
  const comparisons = getCategoryComparison(expenses);
  if (comparisons.length === 0) return null;

  const increases = comparisons.filter((c) => c.absoluteChange > 0);
  if (increases.length === 0) return null;

  return increases.reduce((biggest, current) =>
    current.absoluteChange > biggest.absoluteChange ? current : biggest
  );
}
