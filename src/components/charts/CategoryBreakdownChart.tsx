"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Expense } from "@/lib/types";
import { CATEGORY_STYLES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface CategoryBreakdownChartProps {
  expenses: Expense[];
}

export default function CategoryBreakdownChart({ expenses }: CategoryBreakdownChartProps) {
  const data = useMemo(() => {
    const totals = new Map<string, number>();
    for (const expense of expenses) {
      totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
    }
    return Array.from(totals.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No data to display
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="category"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_STYLES[entry.category as keyof typeof CATEGORY_STYLES].chart}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {data.map((entry) => {
          const style = CATEGORY_STYLES[entry.category as keyof typeof CATEGORY_STYLES];
          return (
            <li key={entry.category} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 truncate text-slate-600">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: style.chart }}
                />
                {entry.category}
              </span>
              <span className="shrink-0 font-medium text-slate-900">
                {formatCurrency(entry.value)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
