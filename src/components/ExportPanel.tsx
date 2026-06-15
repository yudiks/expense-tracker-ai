"use client";

import { useMemo, useState } from "react";
import { Download, FileJson, FileSpreadsheet, FileText, Loader2, X } from "lucide-react";
import { CATEGORIES, type Category, type Expense } from "@/lib/types";
import {
  downloadExport,
  filterExpensesForExport,
  type ExportFormat,
} from "@/lib/exportEngine";
import { formatCurrency, formatDate, todayISO } from "@/lib/utils";

interface ExportPanelProps {
  expenses: Expense[];
  onClose: () => void;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string; icon: typeof FileSpreadsheet }[] = [
  { value: "csv", label: "CSV", description: "Spreadsheet-friendly format", icon: FileSpreadsheet },
  { value: "json", label: "JSON", description: "Structured data with metadata", icon: FileJson },
  { value: "pdf", label: "PDF", description: "Printable report", icon: FileText },
];

export default function ExportPanel({ expenses, onClose }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    try {
      setError(null);
      return filterExpensesForExport(expenses, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : "All",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid filter selection");
      return [];
    }
  }, [expenses, startDate, endDate, selectedCategories]);

  const total = useMemo(
    () => filtered.reduce((sum, e) => sum + e.amount, 0),
    [filtered]
  );

  function toggleCategory(category: Category) {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

  async function handleExport() {
    if (startDate && endDate && startDate > endDate) {
      setError("Start date must be before end date");
      return;
    }
    if (filtered.length === 0) {
      setError("No expenses match the selected filters");
      return;
    }

    setIsExporting(true);
    setError(null);
    try {
      // Allow the UI to render the loading state before the (potentially
      // synchronous and CPU-heavy) PDF generation runs.
      await new Promise((resolve) => setTimeout(resolve, 50));
      downloadExport(filtered, format, `expenses-${todayISO()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Export Data</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Format selection */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {FORMAT_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormat(value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 text-center transition-colors ${
                    format === value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-[11px] leading-tight text-slate-400">{description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="export-start" className="mb-1 block text-sm font-medium text-slate-700">
                Start date
              </label>
              <input
                id="export-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="export-end" className="mb-1 block text-sm font-medium text-slate-700">
                End date
              </label>
              <input
                id="export-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category filter */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Categories <span className="text-slate-400">(none selected = all)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCategories.includes(category)
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Summary / preview */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {filtered.length} record{filtered.length === 1 ? "" : "s"} selected
              </span>
              <span className="font-semibold text-slate-900">{formatCurrency(total)}</span>
            </div>

            {filtered.length > 0 && (
              <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-500">
                {filtered.slice(0, 5).map((e) => (
                  <li key={e.id} className="flex justify-between gap-2">
                    <span className="truncate">
                      {formatDate(e.date)} · {e.category} · {e.description || "(no description)"}
                    </span>
                    <span className="shrink-0 font-medium text-slate-700">
                      {formatCurrency(e.amount)}
                    </span>
                  </li>
                ))}
                {filtered.length > 5 && (
                  <li className="text-slate-400">+{filtered.length - 5} more...</li>
                )}
              </ul>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? "Exporting..." : `Export ${format.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
