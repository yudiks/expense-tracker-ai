"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Expense } from "@/lib/types";
import { formatCurrency, formatMonthLabel, monthKey } from "@/lib/utils";

interface MonthlyTrendChartProps {
  expenses: Expense[];
}

const MONTHS_TO_SHOW = 6;

export default function MonthlyTrendChart({ expenses }: MonthlyTrendChartProps) {
  const data = useMemo(() => {
    const totals = new Map<string, number>();
    for (const expense of expenses) {
      const key = monthKey(expense.date);
      totals.set(key, (totals.get(key) ?? 0) + expense.amount);
    }

    return Array.from(totals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-MONTHS_TO_SHOW)
      .map(([key, total]) => ({ month: formatMonthLabel(key), total }));
  }, [expenses]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No data to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) => `$${value}`}
          width={56}
        />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
