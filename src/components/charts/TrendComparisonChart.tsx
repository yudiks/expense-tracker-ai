"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Expense } from "@/lib/types";
import { getMonthlyTotals } from "@/lib/analytics";
import { formatCurrency, formatMonthLabel } from "@/lib/utils";

interface TrendComparisonChartProps {
  expenses: Expense[];
}

const MONTHS_TO_SHOW = 6;

/**
 * Shows the recent monthly spending trend alongside the previous month's
 * total for quick visual comparison of how the current month is tracking.
 */
export default function TrendComparisonChart({ expenses }: TrendComparisonChartProps) {
  const data = useMemo(() => {
    const totals = getMonthlyTotals(expenses).slice(-MONTHS_TO_SHOW);
    return totals.map((entry, index) => ({
      month: formatMonthLabel(entry.month),
      total: entry.total,
      previous: index > 0 ? totals[index - 1].total : null,
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
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) => `$${value}`}
          width={56}
        />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="total"
          name="Spending"
          stroke="#6366f1"
          fill="url(#totalFill)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="previous"
          name="Prior month"
          stroke="#94a3b8"
          strokeDasharray="4 4"
          fill="none"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
