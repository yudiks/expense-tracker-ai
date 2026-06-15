"use client";

import { useCallback, useEffect, useState } from "react";
import type { Expense, ExpenseInput } from "@/lib/types";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "expense-tracker:expenses";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setExpenses(JSON.parse(raw) as Expense[]);
      }
    } catch {
      // ignore corrupted storage
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses, isLoaded]);

  const addExpense = useCallback((input: ExpenseInput) => {
    setExpenses((prev) => [
      { ...input, id: generateId(), createdAt: Date.now() },
      ...prev,
    ]);
  }, []);

  const updateExpense = useCallback((id: string, input: ExpenseInput) => {
    setExpenses((prev) =>
      prev.map((expense) => (expense.id === id ? { ...expense, ...input } : expense))
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  }, []);

  return { expenses, isLoaded, addExpense, updateExpense, deleteExpense };
}
