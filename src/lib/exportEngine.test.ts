import { describe, expect, it } from "vitest";
import type { Expense } from "./types";
import {
  buildPDF,
  filterExpensesForExport,
  generateCSV,
  generateJSON,
} from "./exportEngine";

const sampleExpenses: Expense[] = [
  {
    id: "1",
    date: "2026-06-01",
    amount: 12.5,
    category: "Food",
    description: "Groceries",
    createdAt: 1,
  },
  {
    id: "2",
    date: "2026-06-10",
    amount: 45,
    category: "Transportation",
    description: "Gas, full tank",
    createdAt: 2,
  },
  {
    id: "3",
    date: "2026-05-20",
    amount: 100,
    category: "Bills",
    description: 'Electricity "summer" rate',
    createdAt: 3,
  },
];

describe("filterExpensesForExport", () => {
  it("returns all expenses sorted by date descending when no filters given", () => {
    const result = filterExpensesForExport(sampleExpenses);
    expect(result.map((e) => e.id)).toEqual(["2", "1", "3"]);
  });

  it("filters by start date", () => {
    const result = filterExpensesForExport(sampleExpenses, { startDate: "2026-06-01" });
    expect(result.map((e) => e.id)).toEqual(["2", "1"]);
  });

  it("filters by end date", () => {
    const result = filterExpensesForExport(sampleExpenses, { endDate: "2026-06-01" });
    expect(result.map((e) => e.id)).toEqual(["1", "3"]);
  });

  it("filters by date range", () => {
    const result = filterExpensesForExport(sampleExpenses, {
      startDate: "2026-06-01",
      endDate: "2026-06-05",
    });
    expect(result.map((e) => e.id)).toEqual(["1"]);
  });

  it("filters by category", () => {
    const result = filterExpensesForExport(sampleExpenses, { categories: ["Food"] });
    expect(result.map((e) => e.id)).toEqual(["1"]);
  });

  it("filters by multiple categories", () => {
    const result = filterExpensesForExport(sampleExpenses, {
      categories: ["Food", "Bills"],
    });
    expect(result.map((e) => e.id)).toEqual(["1", "3"]);
  });

  it("treats 'All' categories as no filter", () => {
    const result = filterExpensesForExport(sampleExpenses, { categories: "All" });
    expect(result).toHaveLength(3);
  });

  it("returns empty array for an empty input list", () => {
    expect(filterExpensesForExport([])).toEqual([]);
  });

  it("throws for an invalid date range (start after end)", () => {
    expect(() =>
      filterExpensesForExport(sampleExpenses, {
        startDate: "2026-06-10",
        endDate: "2026-06-01",
      })
    ).toThrow(/invalid date range/i);
  });
});

describe("generateCSV", () => {
  it("includes a header row with the expected columns", () => {
    const csv = generateCSV([]);
    expect(csv).toBe("Date,Category,Amount,Description");
  });

  it("generates a row per expense with formatted amount", () => {
    const csv = generateCSV([sampleExpenses[0]]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe("2026-06-01,Food,12.50,Groceries");
  });

  it("escapes descriptions containing commas and quotes", () => {
    const csv = generateCSV([sampleExpenses[2]]);
    const lines = csv.split("\n");
    expect(lines[1]).toBe('2026-05-20,Bills,100.00,"Electricity ""summer"" rate"');
  });
});

describe("generateJSON", () => {
  it("produces valid JSON with metadata and expenses", () => {
    const json = generateJSON(sampleExpenses);
    const parsed = JSON.parse(json);

    expect(parsed.recordCount).toBe(3);
    expect(parsed.totalAmount).toBeCloseTo(157.5);
    expect(parsed.expenses).toHaveLength(3);
    expect(typeof parsed.exportedAt).toBe("string");
  });

  it("handles an empty expense list", () => {
    const json = generateJSON([]);
    const parsed = JSON.parse(json);

    expect(parsed.recordCount).toBe(0);
    expect(parsed.totalAmount).toBe(0);
    expect(parsed.expenses).toEqual([]);
  });
});

describe("buildPDF", () => {
  it("does not throw when building a report from sample expenses", () => {
    expect(() => buildPDF(sampleExpenses)).not.toThrow();
  });

  it("does not throw when building a report from an empty list", () => {
    expect(() => buildPDF([])).not.toThrow();
  });

  it("returns a jsPDF instance with output capability", () => {
    const doc = buildPDF(sampleExpenses);
    expect(typeof doc.output).toBe("function");
  });
});
