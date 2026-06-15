"use client";

import { useState } from "react";
import { Pencil, Receipt, Trash2 } from "lucide-react";
import type { Expense } from "@/lib/types";
import { CATEGORY_STYLES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ExpenseListProps {
  expenses: Expense[];
  totalCount: number;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseList({ expenses, totalCount, onEdit, onDelete }: ExpenseListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Receipt className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-slate-700">
          {totalCount === 0 ? "No expenses yet" : "No expenses match your filters"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {totalCount === 0
            ? "Add your first expense to get started."
            : "Try adjusting your search or filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <ul className="divide-y divide-slate-100">
        {expenses.map((expense) => {
          const style = CATEGORY_STYLES[expense.category];
          const Icon = style.icon;
          const isConfirming = confirmId === expense.id;

          return (
            <li
              key={expense.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 sm:gap-4"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.text}`}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{expense.description}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                  <span>{formatDate(expense.date)}</span>
                  <span aria-hidden>•</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${style.bg} ${style.text}`}>
                    {expense.category}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-slate-900">{formatCurrency(expense.amount)}</p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {isConfirming ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(expense.id);
                        setConfirmId(null);
                      }}
                      className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onEdit(expense)}
                      aria-label="Edit expense"
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(expense.id)}
                      aria-label="Delete expense"
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
