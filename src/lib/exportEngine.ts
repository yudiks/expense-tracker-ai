import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Category, Expense } from "./types";
import { formatCurrency, formatDate } from "./utils";

export type ExportFormat = "csv" | "json" | "pdf";

export interface ExportOptions {
  startDate?: string;
  endDate?: string;
  categories?: Category[] | "All";
}

/**
 * Filters expenses by an optional date range and category set.
 * Throws if the date range is invalid (startDate after endDate).
 */
export function filterExpensesForExport(
  expenses: Expense[],
  options: ExportOptions = {}
): Expense[] {
  const { startDate, endDate, categories } = options;

  if (startDate && endDate && startDate > endDate) {
    throw new Error("Invalid date range: start date must be before end date");
  }

  return expenses
    .filter((expense) => {
      if (startDate && expense.date < startDate) return false;
      if (endDate && expense.date > endDate) return false;
      if (categories && categories !== "All" && categories.length > 0) {
        if (!categories.includes(expense.category)) return false;
      }
      return true;
    })
    .sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date)));
}

const CSV_HEADERS = ["Date", "Category", "Amount", "Description"];

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generates CSV content for the given expenses.
 * Columns: Date, Category, Amount, Description
 */
export function generateCSV(expenses: Expense[]): string {
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.amount.toFixed(2),
    escapeCsvField(e.description),
  ]);

  return [CSV_HEADERS, ...rows].map((row) => row.join(",")).join("\n");
}

/**
 * Generates a pretty-printed JSON export of the given expenses,
 * including basic metadata about the export.
 */
export function generateJSON(expenses: Expense[]): string {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const payload = {
    exportedAt: new Date().toISOString(),
    recordCount: expenses.length,
    totalAmount: Math.round(total * 100) / 100,
    expenses,
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Builds a PDF report document for the given expenses.
 * Returns the jsPDF instance so callers can save/preview it.
 */
export function buildPDF(expenses: Expense[]): jsPDF {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Expense Report", 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100);
  const generatedLabel = `Generated: ${new Date().toLocaleString("en-US")}`;
  doc.text(generatedLabel, 14, 25);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  doc.text(`Records: ${expenses.length}    Total: ${formatCurrency(total)}`, 14, 31);

  autoTable(doc, {
    startY: 37,
    head: [["Date", "Category", "Amount", "Description"]],
    body: expenses.map((e) => [
      formatDate(e.date),
      e.category,
      formatCurrency(e.amount),
      e.description,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [79, 70, 229] },
    columnStyles: {
      2: { halign: "right" },
    },
  });

  if (expenses.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text("No expenses match the selected filters.", 14, 45);
  }

  return doc;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  if (typeof document === "undefined") return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates the requested export format from the given expenses and
 * triggers a browser download. Throws on unsupported formats.
 */
export function downloadExport(
  expenses: Expense[],
  format: ExportFormat,
  filenameBase = "expenses"
): void {
  switch (format) {
    case "csv":
      downloadBlob(generateCSV(expenses), `${filenameBase}.csv`, "text/csv;charset=utf-8;");
      break;
    case "json":
      downloadBlob(generateJSON(expenses), `${filenameBase}.json`, "application/json;charset=utf-8;");
      break;
    case "pdf": {
      const doc = buildPDF(expenses);
      doc.save(`${filenameBase}.pdf`);
      break;
    }
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}
