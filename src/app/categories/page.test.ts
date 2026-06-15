import { describe, expect, it } from "vitest";
import type { Expense } from "@/lib/types";
import { getTopCategories } from "@/lib/analytics";
import { CATEGORY_STYLES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const sampleExpenses: Expense[] = [
  { id: "1", date: "2026-06-01", amount: 50, category: "Food", description: "Groceries", createdAt: 1 },
  { id: "2", date: "2026-06-02", amount: 30, category: "Transportation", description: "Gas", createdAt: 2 },
  { id: "3", date: "2026-06-03", amount: 20, category: "Food", description: "Lunch", createdAt: 3 },
];

describe("Top Expense Categories page data", () => {
  it("every category returned by getTopCategories has a matching CATEGORY_STYLES entry", () => {
    const topCategories = getTopCategories(sampleExpenses);
    expect(topCategories.length).toBeGreaterThan(0);

    for (const { category } of topCategories) {
      const style = CATEGORY_STYLES[category];
      expect(style).toBeDefined();
      expect(style.icon).toBeDefined();
      expect(style.chart).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("ranks categories by total descending and computes progress bar widths from share", () => {
    const topCategories = getTopCategories(sampleExpenses);

    // Food (70) should rank above Transportation (30)
    expect(topCategories[0].category).toBe("Food");
    expect(topCategories[0].total).toBe(70);
    expect(topCategories[1].category).toBe("Transportation");
    expect(topCategories[1].total).toBe(30);

    // Shares should sum to 1 and translate to valid progress bar widths (0-100%)
    const totalShare = topCategories.reduce((sum, c) => sum + c.share, 0);
    expect(totalShare).toBeCloseTo(1);

    for (const { share } of topCategories) {
      const widthPercent = share * 100;
      expect(widthPercent).toBeGreaterThanOrEqual(0);
      expect(widthPercent).toBeLessThanOrEqual(100);
    }

    expect(formatCurrency(topCategories[0].total)).toBe("$70.00");
  });

  it("returns an empty array (empty state) when there are no expenses", () => {
    expect(getTopCategories([])).toEqual([]);
  });
});
