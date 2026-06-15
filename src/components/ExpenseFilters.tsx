"use client";

import { Search, XCircle } from "lucide-react";
import { CATEGORIES, type ExpenseFilters } from "@/lib/types";

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
}

const EMPTY_FILTERS: ExpenseFilters = {
  search: "",
  category: "All",
  startDate: "",
  endDate: "",
};

export default function ExpenseFiltersBar({ filters, onChange }: ExpenseFiltersProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "All" ||
    filters.startDate !== "" ||
    filters.endDate !== "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search descriptions..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={filters.category}
            onChange={(e) =>
              onChange({ ...filters, category: e.target.value as ExpenseFilters["category"] })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            max={filters.endDate || undefined}
            aria-label="Start date"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            min={filters.startDate || undefined}
            aria-label="End date"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => onChange(EMPTY_FILTERS)}
              title="Clear filters"
              className="flex shrink-0 items-center justify-center rounded-lg border border-slate-200 px-2.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { EMPTY_FILTERS };
