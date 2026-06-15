"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Expense } from "@/lib/types";
import { getCategoryComparison } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

interface CategoryComparisonChartProps {
  expenses: Expense[];
}

/**
 * Compares per-category spend for the current month against the previous
 * month so users can quickly spot categories that grew or shrank.
 */
export default function CategoryComparisonChart({ expenses }: CategoryComparisonChartProps) {
  const data = useMemo(() => {
    return getCategoryComparison(expenses).map((entry) => ({
      category: entry.category,
      current: entry.current,
      previous: entry.previous,
    }));
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
        <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) => `$${value}`}
          width={56}
        />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} cursor={{ fill: "#f1f5f9" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="previous" name="Last month" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
        <Bar dataKey="current" name="This month" fill="#6366f1" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
