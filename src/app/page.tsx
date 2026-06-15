"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import SummaryCards from "@/components/SummaryCards";
import ExpenseFiltersBar, { EMPTY_FILTERS } from "@/components/ExpenseFilters";
import ExpenseList from "@/components/ExpenseList";
import ExpenseFormModal from "@/components/ExpenseFormModal";
import CategoryBreakdownChart from "@/components/charts/CategoryBreakdownChart";
import MonthlyTrendChart from "@/components/charts/MonthlyTrendChart";
import { useExpenses } from "@/hooks/useExpenses";
import type { Expense, ExpenseFilters, ExpenseInput } from "@/lib/types";
import { exportExpensesToCSV } from "@/lib/utils";

export default function Home() {
  const { expenses, isLoaded, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [filters, setFilters] = useState<ExpenseFilters>(EMPTY_FILTERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        if (filters.category !== "All" && expense.category !== filters.category) return false;
        if (filters.startDate && expense.date < filters.startDate) return false;
        if (filters.endDate && expense.date > filters.endDate) return false;
        if (
          filters.search &&
          !expense.description.toLowerCase().includes(filters.search.toLowerCase())
        )
          return false;
        return true;
      })
      .sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date)));
  }, [expenses, filters]);

  function openAddModal() {
    setEditingExpense(null);
    setIsModalOpen(true);
  }

  function openEditModal(expense: Expense) {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingExpense(null);
  }

  function handleSave(input: ExpenseInput) {
    if (editingExpense) {
      updateExpense(editingExpense.id, input);
    } else {
      addExpense(input);
    }
    closeModal();
  }

  function handleExport() {
    exportExpensesToCSV(filteredExpenses);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onAddExpense={openAddModal}
        onExport={handleExport}
        exportDisabled={filteredExpenses.length === 0}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {!isLoaded ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            Loading your expenses...
          </div>
        ) : (
          <>
            <SummaryCards expenses={expenses} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-2 text-sm font-semibold text-slate-900">Spending by Category</h2>
                <CategoryBreakdownChart expenses={expenses} />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-2 text-sm font-semibold text-slate-900">Monthly Trend</h2>
                <MonthlyTrendChart expenses={expenses} />
              </div>
            </div>

            <ExpenseFiltersBar filters={filters} onChange={setFilters} />

            <ExpenseList
              expenses={filteredExpenses}
              totalCount={expenses.length}
              onEdit={openEditModal}
              onDelete={deleteExpense}
            />
          </>
        )}
      </main>

      {isModalOpen && (
        <ExpenseFormModal expense={editingExpense} onSave={handleSave} onClose={closeModal} />
      )}
    </div>
  );
}
