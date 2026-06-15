"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import InsightsPanel from "@/components/InsightsPanel";
import TrendComparisonChart from "@/components/charts/TrendComparisonChart";
import CategoryComparisonChart from "@/components/charts/CategoryComparisonChart";
import { useExpenses } from "@/hooks/useExpenses";

export default function AnalyticsPage() {
  const { expenses, isLoaded } = useExpenses();

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
              Analytics Dashboard
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              Deeper insights into your spending trends
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {!isLoaded ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            Loading your expenses...
          </div>
        ) : (
          <>
            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Insights</h2>
              <InsightsPanel expenses={expenses} />
            </section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-2 text-sm font-semibold text-slate-900">
                  Spending Trend vs Prior Month
                </h2>
                <TrendComparisonChart expenses={expenses} />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-2 text-sm font-semibold text-slate-900">
                  Category Comparison: This Month vs Last
                </h2>
                <CategoryComparisonChart expenses={expenses} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
