"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Calendar, Flame, TrendingUp, Trophy } from "lucide-react";
import type { Expense } from "@/lib/types";
import {
  getAverageSpend,
  getBiggestCategoryJump,
  getLargestExpenses,
  getMonthOverMonthChange,
  getSpendingTrend,
  getTopCategories,
} from "@/lib/analytics";
import { formatCurrency, formatDate, formatMonthLabel } from "@/lib/utils";

interface InsightsPanelProps {
  expenses: Expense[];
}

export default function InsightsPanel({ expenses }: InsightsPanelProps) {
  const insights = useMemo(() => {
    const momChange = getMonthOverMonthChange(expenses);
    const topCategories = getTopCategories(expenses, 3);
    const averages = getAverageSpend(expenses);
    const trend = getSpendingTrend(expenses);
    const biggestJump = getBiggestCategoryJump(expenses);
    const [largestExpense] = getLargestExpenses(expenses, 1);

    return { momChange, topCategories, averages, trend, biggestJump, largestExpense };
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-400">
        Add some expenses to see personalized insights.
      </div>
    );
  }

  const { momChange, topCategories, averages, trend, biggestJump, largestExpense } = insights;

  const cards: { icon: typeof TrendingUp; title: string; description: string; tone: "up" | "down" | "neutral" }[] = [];

  // Month-over-month change
  if (momChange.currentMonth) {
    if (momChange.previousMonth === null) {
      cards.push({
        icon: Calendar,
        title: `${formatMonthLabel(momChange.currentMonth)} so far`,
        description: `You've spent ${formatCurrency(momChange.currentTotal)} this month. We'll show month-over-month comparisons once more data is available.`,
        tone: "neutral",
      });
    } else {
      const isIncrease = momChange.absoluteChange > 0;
      const isDecrease = momChange.absoluteChange < 0;
      const percentLabel =
        momChange.percentChange === null
          ? ""
          : ` (${momChange.percentChange > 0 ? "+" : ""}${momChange.percentChange.toFixed(1)}%)`;
      cards.push({
        icon: isIncrease ? ArrowUp : isDecrease ? ArrowDown : ArrowRight,
        title: isIncrease
          ? "Spending is up"
          : isDecrease
            ? "Spending is down"
            : "Spending is steady",
        description: `${formatMonthLabel(momChange.currentMonth)} spending is ${formatCurrency(
          Math.abs(momChange.absoluteChange)
        )} ${isIncrease ? "higher" : isDecrease ? "lower" : "the same"} than ${formatMonthLabel(
          momChange.previousMonth
        )}${percentLabel}.`,
        tone: isIncrease ? "up" : isDecrease ? "down" : "neutral",
      });
    }
  }

  // Trend direction
  if (trend.monthsConsidered > 0) {
    const trendLabel =
      trend.direction === "up"
        ? "trending upward"
        : trend.direction === "down"
          ? "trending downward"
          : "holding steady";
    cards.push({
      icon: TrendingUp,
      title: `Spending is ${trendLabel}`,
      description: `Over the last ${trend.monthsConsidered + 1} months, your monthly spending has changed by an average of ${formatCurrency(
        Math.abs(trend.averageChange)
      )} per month.`,
      tone: trend.direction === "up" ? "up" : trend.direction === "down" ? "down" : "neutral",
    });
  }

  // Top category
  if (topCategories.length > 0) {
    const top = topCategories[0];
    cards.push({
      icon: Trophy,
      title: `${top.category} is your top category`,
      description: `${formatCurrency(top.total)} spent on ${top.category} — ${(top.share * 100).toFixed(
        1
      )}% of your total spending.`,
      tone: "neutral",
    });
  }

  // Biggest category jump
  if (biggestJump) {
    cards.push({
      icon: Flame,
      title: `${biggestJump.category} spending jumped`,
      description: `${biggestJump.category} spending increased by ${formatCurrency(
        biggestJump.absoluteChange
      )} compared to last month.`,
      tone: "up",
    });
  }

  // Largest expense
  if (largestExpense) {
    cards.push({
      icon: Calendar,
      title: "Largest single expense",
      description: `${formatCurrency(largestExpense.amount)} on ${largestExpense.description || largestExpense.category} (${formatDate(
        largestExpense.date
      )}).`,
      tone: "neutral",
    });
  }

  // Average spend
  cards.push({
    icon: Calendar,
    title: "Average spend",
    description: `You spend about ${formatCurrency(averages.daily)} per day, ${formatCurrency(
      averages.weekly
    )} per week, and ${formatCurrency(averages.monthly)} per month on average.`,
    tone: "neutral",
  });

  const toneStyles: Record<string, string> = {
    up: "bg-rose-100 text-rose-600",
    down: "bg-emerald-100 text-emerald-600",
    neutral: "bg-indigo-100 text-indigo-600",
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneStyles[card.tone]}`}>
              <card.icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{card.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{card.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
