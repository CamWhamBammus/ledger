import type { Account, AccountType, Category, Repeat, TransactionType, TransactionWithRelations } from "@/types";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? "Something went wrong.");
  }
  return res.json();
}

export interface Summary {
  incomeThisMonth: number;
  expenseThisMonth: number;
  netThisMonth: number;
  unpaidBillsCount: number;
}

export interface MonthlyStat {
  month: string; // "2026-08"
  label: string; // "Aug"
  income: number;
  expense: number;
}

export const api = {
  listCategories: () => fetch("/api/categories", { cache: "no-store" }).then((r) => json<Category[]>(r)),

  createCategory: (data: { name: string; color: string; budgetMonthly?: number | null }) =>
    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => json<Category>(r)),

  updateCategory: (id: string, data: Partial<{ name: string; color: string; budgetMonthly: number | null }>) =>
    fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => json<Category>(r)),

  deleteCategory: (id: string) => fetch(`/api/categories/${id}`, { method: "DELETE" }).then((r) => json(r)),

  listAccounts: () => fetch("/api/accounts", { cache: "no-store" }).then((r) => json<Account[]>(r)),

  createAccount: (data: { name: string; type: AccountType; color: string; startingBalance?: number }) =>
    fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => json<Account>(r)),

  updateAccount: (
    id: string,
    data: Partial<{ name: string; type: AccountType; color: string; startingBalance: number }>
  ) =>
    fetch(`/api/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => json<Account>(r)),

  deleteAccount: (id: string) => fetch(`/api/accounts/${id}`, { method: "DELETE" }).then((r) => json(r)),

  listTransactions: () =>
    fetch("/api/transactions", { cache: "no-store" }).then((r) => json<TransactionWithRelations[]>(r)),

  createTransaction: (data: {
    description: string;
    amount: number;
    type: TransactionType;
    date: string;
    accountId: string;
    notes?: string;
    categoryId?: string | null;
    repeat?: Repeat;
    paid?: boolean;
  }) =>
    fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => json<TransactionWithRelations>(r)),

  updateTransaction: (
    id: string,
    data: Partial<{
      description: string;
      amount: number;
      type: TransactionType;
      date: string;
      accountId: string;
      notes: string | null;
      categoryId: string | null;
      repeat: Repeat;
      paid: boolean;
    }>
  ) =>
    fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => json<TransactionWithRelations>(r)),

  deleteTransaction: (id: string) => fetch(`/api/transactions/${id}`, { method: "DELETE" }).then((r) => json(r)),

  importTransactions: (data: {
    accountId: string;
    rows: { description: string; amount: number; type: TransactionType; date: string }[];
  }) =>
    fetch("/api/transactions/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => json<{ created: number }>(r)),

  getSummary: () => fetch("/api/summary", { cache: "no-store" }).then((r) => json<Summary>(r)),

  getMonthlyStats: () => fetch("/api/stats/monthly", { cache: "no-store" }).then((r) => json<MonthlyStat[]>(r)),
};
