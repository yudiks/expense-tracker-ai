export const CATEGORIES = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Expense {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  amount: number;
  category: Category;
  description: string;
  createdAt: number;
}

export type ExpenseInput = Omit<Expense, "id" | "createdAt">;

export interface ExpenseFilters {
  search: string;
  category: Category | "All";
  startDate: string;
  endDate: string;
}
