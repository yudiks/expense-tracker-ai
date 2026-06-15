"use client";

import { useMemo } from "react";
import { CreditCard, ListChecks, TrendingUp, Wallet } from "lucide-react";
import type { Expense } from "@/lib/types";
import { CATEGORY_STYLES } from "@/lib/constants";
import { currentMonthKey, formatCurrency, monthKey } from "@/lib/utils";

interface SummaryCardsProps {
  expenses: Expense[];
}

export default function SummaryCards({ expenses }: SummaryCardsProps) {
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const thisMonth = currentMonthKey();
    const monthExpenses = expenses.filter((e) => monthKey(e.date) === thisMonth);
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryTotals = new Map<string, number>();
    for (const e of expenses) {
      categoryTotals.set(e.category, (categoryTotals.get(e.category) ?? 0) + e.amount);
    }
    let topCategory: string | null = null;
    let topCategoryAmount = 0;
    categoryTotals.forEach((amount, category) => {
      if (amount > topCategoryAmount) {
        topCategory = category;
        topCategoryAmount = amount;
      }
    });

    return {
      total,
      monthTotal,
      count: expenses.length,
      topCategory,
      topCategoryAmount,
    };
  }, [expenses]);

  const topStyle = stats.topCategory
    ? CATEGORY_STYLES[stats.topCategory as keyof typeof CATEGORY_STYLES]
    : null;
  const TopIcon = topStyle?.icon;

  const cards = [
    {
      label: "Total Spending",
      value: formatCurrency(stats.total),
      icon: Wallet,
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-600",
    },
    {
      label: "This Month",
      value: formatCurrency(stats.monthTotal),
      icon: TrendingUp,
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
    },
    {
      label: "Transactions",
      value: stats.count.toString(),
      icon: ListChecks,
      iconBg: "bg-sky-100",
      iconText: "text-sky-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg} ${card.iconText}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
              <p className="text-lg font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              topStyle ? topStyle.bg : "bg-slate-100"
            } ${topStyle ? topStyle.text : "text-slate-500"}`}
          >
            {TopIcon ? <TopIcon className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Top Category</p>
            <p className="text-lg font-bold text-slate-900">
              {stats.topCategory ?? "—"}
            </p>
            {stats.topCategory && (
              <p className="text-xs text-slate-500">{formatCurrency(stats.topCategoryAmount)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
