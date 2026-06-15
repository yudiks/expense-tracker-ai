import { describe, expect, it } from "vitest";
import type { Expense } from "./types";
import {
  getAverageSpend,
  getBiggestCategoryJump,
  getCategoryComparison,
  getLargestExpenses,
  getMonthlyTotals,
  getMonthOverMonthChange,
  getSpendingTrend,
  getTopCategories,
} from "./analytics";

let idCounter = 0;
function makeExpense(overrides: Partial<Expense>): Expense {
  idCounter += 1;
  return {
    id: `id-${idCounter}`,
    date: "2024-01-01",
    amount: 10,
    category: "Food",
    description: "test",
    createdAt: idCounter,
    ...overrides,
  };
}

describe("getMonthlyTotals", () => {
  it("returns an empty array for no expenses", () => {
    expect(getMonthlyTotals([])).toEqual([]);
  });

  it("aggregates totals per month, sorted ascending", () => {
    const expenses: Expense[] = [
      makeExpense({ date: "2024-02-10", amount: 20 }),
      makeExpense({ date: "2024-01-05", amount: 10 }),
      makeExpense({ date: "2024-01-20", amount: 5 }),
    ];
    expect(getMonthlyTotals(expenses)).toEqual([
      { month: "2024-01", total: 15 },
      { month: "2024-02", total: 20 },
    ]);
  });
});

describe("getMonthOverMonthChange", () => {
  it("handles an empty expense list", () => {
    const result = getMonthOverMonthChange([]);
    expect(result).toEqual({
      currentMonth: null,
      previousMonth: null,
      currentTotal: 0,
      previousTotal: 0,
      absoluteChange: 0,
      percentChange: null,
    });
  });

  it("handles a single month of data (no previous month, avoids division by zero)", () => {
    const expenses: Expense[] = [makeExpense({ date: "2024-01-05", amount: 100 })];
    const result = getMonthOverMonthChange(expenses);
    expect(result.currentMonth).toBe("2024-01");
    expect(result.previousMonth).toBeNull();
    expect(result.currentTotal).toBe(100);
    expect(result.previousTotal).toBe(0);
    expect(result.absoluteChange).toBe(100);
    expect(result.percentChange).toBeNull();
  });

  it("computes percent and absolute change across two months", () => {
    const expenses: Expense[] = [
      makeExpense({ date: "2024-01-10", amount: 100 }),
      makeExpense({ date: "2024-02-10", amount: 150 }),
    ];
    const result = getMonthOverMonthChange(expenses);
    expect(result.currentMonth).toBe("2024-02");
    expect(result.previousMonth).toBe("2024-01");
    expect(result.currentTotal).toBe(150);
    expect(result.previousTotal).toBe(100);
    expect(result.absoluteChange).toBe(50);
    expect(result.percentChange).toBe(50);
  });

  it("handles a decrease in spending", () => {
    const expenses: Expense[] = [
      makeExpense({ date: "2024-01-10", amount: 200 }),
      makeExpense({ date: "2024-02-10", amount: 100 }),
    ];
    const result = getMonthOverMonthChange(expenses);
    expect(result.absoluteChange).toBe(-100);
    expect(result.percentChange).toBe(-50);
  });
});

describe("getTopCategories", () => {
  it("returns an empty array for no expenses", () => {
    expect(getTopCategories([])).toEqual([]);
  });

  it("ranks categories by total spend with correct shares", () => {
    const expenses: Expense[] = [
      makeExpense({ category: "Food", amount: 60 }),
      makeExpense({ category: "Transportation", amount: 40 }),
    ];
    const result = getTopCategories(expenses);
    expect(result).toEqual([
      { category: "Food", total: 60, share: 0.6 },
      { category: "Transportation", total: 40, share: 0.4 },
    ]);
  });

  it("respects the limit argument", () => {
    const expenses: Expense[] = [
      makeExpense({ category: "Food", amount: 60 }),
      makeExpense({ category: "Transportation", amount: 40 }),
      makeExpense({ category: "Bills", amount: 20 }),
    ];
    const result = getTopCategories(expenses, 2);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.category)).toEqual(["Food", "Transportation"]);
  });
});

describe("getAverageSpend", () => {
  it("returns zeros for no expenses", () => {
    expect(getAverageSpend([])).toEqual({ daily: 0, weekly: 0, monthly: 0 });
  });

  it("computes averages for a single day", () => {
    const expenses: Expense[] = [makeExpense({ date: "2024-01-01", amount: 10 })];
    const result = getAverageSpend(expenses);
    expect(result.daily).toBe(10);
    expect(result.weekly).toBe(70);
    expect(result.monthly).toBe(300);
  });

  it("computes averages across a date range", () => {
    const expenses: Expense[] = [
      makeExpense({ date: "2024-01-01", amount: 10 }),
      makeExpense({ date: "2024-01-11", amount: 10 }),
    ];
    // span = 11 days inclusive, total = 20
    const result = getAverageSpend(expenses);
    expect(result.daily).toBeCloseTo(20 / 11, 5);
  });
});

describe("getSpendingTrend", () => {
  it("returns flat with no data considered for empty list", () => {
    const result = getSpendingTrend([]);
    expect(result.direction).toBe("flat");
    expect(result.monthsConsidered).toBe(0);
  });

  it("returns flat for a single month of data", () => {
    const expenses: Expense[] = [makeExpense({ date: "2024-01-05", amount: 100 })];
    const result = getSpendingTrend(expenses);
    expect(result.direction).toBe("flat");
    expect(result.monthsConsidered).toBe(0);
  });

  it("detects an upward trend", () => {
    const expenses: Expense[] = [
      makeExpense({ date: "2024-01-10", amount: 100 }),
      makeExpense({ date: "2024-02-10", amount: 200 }),
      makeExpense({ date: "2024-03-10", amount: 300 }),
    ];
    const result = getSpendingTrend(expenses);
    expect(result.direction).toBe("up");
    expect(result.monthsConsidered).toBe(2);
  });

  it("detects a downward trend", () => {
    const expenses: Expense[] = [
      makeExpense({ date: "2024-01-10", amount: 300 }),
      makeExpense({ date: "2024-02-10", amount: 200 }),
      makeExpense({ date: "2024-03-10", amount: 100 }),
    ];
    const result = getSpendingTrend(expenses);
    expect(result.direction).toBe("down");
  });

  it("detects a flat trend when change is within threshold", () => {
    const expenses: Expense[] = [
      makeExpense({ date: "2024-01-10", amount: 100 }),
      makeExpense({ date: "2024-02-10", amount: 101 }),
    ];
    const result = getSpendingTrend(expenses);
    expect(result.direction).toBe("flat");
  });
});

describe("getLargestExpenses", () => {
  it("returns an empty array for no expenses", () => {
    expect(getLargestExpenses([])).toEqual([]);
  });

  it("returns the top N expenses sorted descending by amount", () => {
    const expenses: Expense[] = [
      makeExpense({ amount: 10 }),
      makeExpense({ amount: 50 }),
      makeExpense({ amount: 30 }),
    ];
    const result = getLargestExpenses(expenses, 2);
    expect(result.map((e) => e.amount)).toEqual([50, 30]);
  });
});

describe("getCategoryComparison", () => {
  it("returns an empty array for no expenses", () => {
    expect(getCategoryComparison([])).toEqual([]);
  });

  it("handles a single month (previous totals default to 0, no division by zero)", () => {
    const expenses: Expense[] = [makeExpense({ date: "2024-01-05", category: "Food", amount: 100 })];
    const result = getCategoryComparison(expenses);
    expect(result).toEqual([
      { category: "Food", current: 100, previous: 0, absoluteChange: 100, percentChange: null },
    ]);
  });

  it("compares categories across two months", () => {
    const expenses: Expense[] = [
      makeExpense({ date: "2024-01-05", category: "Food", amount: 100 }),
      makeExpense({ date: "2024-02-05", category: "Food", amount: 150 }),
      makeExpense({ date: "2024-02-05", category: "Bills", amount: 50 }),
    ];
    const result = getCategoryComparison(expenses);
    const food = result.find((r) => r.category === "Food");
    const bills = result.find((r) => r.category === "Bills");
    expect(food).toEqual({ category: "Food", current: 150, previous: 100, absoluteChange: 50, percentChange: 50 });
    expect(bills).toEqual({ category: "Bills", current: 50, previous: 0, absoluteChange: 50, percentChange: null });
  });
});

describe("getBiggestCategoryJump", () => {
  it("returns null for no expenses", () => {
    expect(getBiggestCategoryJump([])).toBeNull();
  });

  it("returns null when there are no increases", () => {
    const expenses: Expense[] = [
      makeExpense({ date: "2024-01-05", category: "Food", amount: 100 }),
      makeExpense({ date: "2024-02-05", category: "Food", amount: 50 }),
    ];
    expect(getBiggestCategoryJump(expenses)).toBeNull();
  });

  it("returns the category with the largest absolute increase", () => {
    const expenses: Expense[] = [
      makeExpense({ date: "2024-01-05", category: "Food", amount: 100 }),
      makeExpense({ date: "2024-01-05", category: "Bills", amount: 50 }),
      makeExpense({ date: "2024-02-05", category: "Food", amount: 110 }),
      makeExpense({ date: "2024-02-05", category: "Bills", amount: 200 }),
    ];
    const result = getBiggestCategoryJump(expenses);
    expect(result?.category).toBe("Bills");
    expect(result?.absoluteChange).toBe(150);
  });
});
