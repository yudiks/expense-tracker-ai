"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CATEGORIES, type Category, type Expense, type ExpenseInput } from "@/lib/types";
import { todayISO } from "@/lib/utils";

interface ExpenseFormModalProps {
  expense: Expense | null;
  onSave: (input: ExpenseInput) => void;
  onClose: () => void;
}

interface FormState {
  date: string;
  amount: string;
  category: Category;
  description: string;
}

interface FormErrors {
  date?: string;
  amount?: string;
  description?: string;
}

function buildInitialState(expense: Expense | null): FormState {
  if (expense) {
    return {
      date: expense.date,
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
    };
  }
  return {
    date: todayISO(),
    amount: "",
    category: "Food",
    description: "",
  };
}

export default function ExpenseFormModal({ expense, onSave, onClose }: ExpenseFormModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(expense));
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!form.date) {
      newErrors.date = "Date is required";
    }

    const amountValue = Number(form.amount);
    if (!form.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (Number.isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length > 200) {
      newErrors.description = "Description must be 200 characters or fewer";
    }

    return newErrors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      date: form.date,
      amount: Math.round(Number(form.amount) * 100) / 100,
      category: form.category,
      description: form.description.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {expense ? "Edit Expense" : "Add Expense"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                errors.date ? "border-red-400" : "border-slate-300"
              }`}
            />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
          </div>

          <div>
            <label htmlFor="amount" className="mb-1 block text-sm font-medium text-slate-700">
              Amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                $
              </span>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className={`w-full rounded-lg border px-3 py-2 pl-7 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                  errors.amount ? "border-red-400" : "border-slate-300"
                }`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
          </div>

          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <input
              id="description"
              type="text"
              placeholder="e.g. Grocery shopping"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                errors.description ? "border-red-400" : "border-slate-300"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              {expense ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
