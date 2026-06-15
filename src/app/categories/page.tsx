"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { getTopCategories } from "@/lib/analytics";
import { CATEGORY_STYLES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default function TopExpenseCategoriesPage() {
  const { expenses, isLoaded } = useExpenses();
  const topCategories = getTopCategories(expenses);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
              Top Expense Categories
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              See which categories take up the most of your spending
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {!isLoaded ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            Loading your expenses...
          </div>
        ) : topCategories.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-center shadow-sm">
            <p className="text-sm font-medium text-slate-700">No expenses yet</p>
            <p className="text-xs text-slate-400">
              Add some expenses to see your top spending categories here.
            </p>
          </div>
        ) : (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Categories by Total Spend
            </h2>
            <ul className="space-y-4">
              {topCategories.map(({ category, total, share }) => {
                const style = CATEGORY_STYLES[category];
                const Icon = style.icon;
                return (
                  <li key={category}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${style.bg} ${style.text}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-medium text-slate-900">{category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(total)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(share * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${share * 100}%`,
                          backgroundColor: style.chart,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
