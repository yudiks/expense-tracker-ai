"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { getTopVendors } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

const INITIAL_LIMIT = 10;

export default function VendorsPage() {
  const { expenses, isLoaded } = useExpenses();
  const [showAll, setShowAll] = useState(false);

  const vendors = useMemo(() => getTopVendors(expenses), [expenses]);
  const visibleVendors = showAll ? vendors : vendors.slice(0, INITIAL_LIMIT);

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
              Top Vendors
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              See where your money is going, by vendor
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {!isLoaded ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            Loading your expenses...
          </div>
        ) : vendors.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-center shadow-sm">
            <Store className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">No vendors yet</p>
            <p className="max-w-xs text-xs text-slate-500">
              Add some expenses with a description to see your top vendors here.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Top {visibleVendors.length} of {vendors.length} vendor
                {vendors.length === 1 ? "" : "s"}
              </h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {visibleVendors.map((vendor, index) => (
                <li key={vendor.vendor} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {vendor.vendor}
                      </p>
                      <p className="flex-none text-sm font-semibold text-slate-900">
                        {formatCurrency(vendor.total)}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${Math.min(100, vendor.share * 100)}%` }}
                        />
                      </div>
                      <p className="flex-none text-xs text-slate-500">
                        {(vendor.share * 100).toFixed(1)}% &middot; {vendor.count}{" "}
                        transaction{vendor.count === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {vendors.length > INITIAL_LIMIT && (
              <div className="border-t border-slate-100 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {showAll ? "Show less" : `Show all ${vendors.length} vendors`}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
