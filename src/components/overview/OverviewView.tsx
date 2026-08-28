"use client";

import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import type { MonthlyStat, Summary } from "@/lib/api-client";
import { ACCOUNT_TYPE_LABELS, CATEGORY_COLOR_CLASSES, categoryColorKey } from "@/types";
import type { Account, Category, TransactionWithRelations } from "@/types";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function OverviewView({
  initialSummary,
  initialUnpaid,
  categories,
  spentByCategory,
  accounts,
  balanceByAccount,
  monthlyStats,
}: {
  initialSummary: Summary;
  initialUnpaid: TransactionWithRelations[];
  categories: Category[];
  spentByCategory: Record<string, number>;
  accounts: Account[];
  balanceByAccount: Record<string, number>;
  monthlyStats: MonthlyStat[];
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [unpaid, setUnpaid] = useState(initialUnpaid);

  async function handleMarkPaid(transaction: TransactionWithRelations) {
    setUnpaid((prev) => prev.filter((t) => t.id !== transaction.id));
    await api.updateTransaction(transaction.id, { paid: true });
    const [freshSummary, allTransactions] = await Promise.all([api.getSummary(), api.listTransactions()]);
    setSummary(freshSummary);
    // Settling a recurring bill spawns the next occurrence server-side, so
    // re-derive the unpaid list rather than trusting local state to have it.
    setUnpaid(
      allTransactions.filter((t) => !t.paid).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  }

  const categoriesWithSpend = categories
    .map((c) => ({ category: c, spent: spentByCategory[c.id] ?? 0 }))
    .filter((c) => c.spent > 0 || c.category.budgetMonthly)
    .sort((a, b) => b.spent - a.spent);

  return (
    <div>
      <h1 className="font-serif text-3xl text-canopy-900">Overview</h1>
      <p className="mt-1 text-sm text-charcoal-600">The state of the books, this month.</p>

      <div className="mt-8 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-walnut-500/15 bg-parchment-paper p-4 shadow-soft">
          <p className="text-xs font-medium tracking-wide text-charcoal-600/60 uppercase">Income</p>
          <p className="mt-1 font-serif text-2xl text-moss-600">{currency.format(summary.incomeThisMonth)}</p>
        </div>
        <div className="rounded-lg border border-walnut-500/15 bg-parchment-paper p-4 shadow-soft">
          <p className="text-xs font-medium tracking-wide text-charcoal-600/60 uppercase">Expenses</p>
          <p className="mt-1 font-serif text-2xl text-clay-500">{currency.format(summary.expenseThisMonth)}</p>
        </div>
        <div className="rounded-lg border border-walnut-500/15 bg-parchment-paper p-4 shadow-soft">
          <p className="text-xs font-medium tracking-wide text-charcoal-600/60 uppercase">Net</p>
          <p className={cn("mt-1 font-serif text-2xl", summary.netThisMonth >= 0 ? "text-moss-600" : "text-clay-500")}>
            {summary.netThisMonth >= 0 ? "+" : "−"}
            {currency.format(Math.abs(summary.netThisMonth))}
          </p>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-medium tracking-wide text-charcoal-600/70 uppercase">Accounts</h2>
          <Link href="/accounts" className="text-xs text-charcoal-600/60 hover:text-canopy-900">
            Manage
          </Link>
        </div>
        <div className="rounded-lg border border-walnut-500/15 bg-parchment-paper p-3 shadow-soft">
          {accounts.length === 0 ? (
            <p className="px-2 py-4 text-sm text-charcoal-600/50">
              No accounts yet.{" "}
              <Link href="/accounts" className="text-canopy-900 underline underline-offset-2">
                Add one
              </Link>
              .
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {accounts.map((account) => {
                const colorKey = categoryColorKey(account.color);
                const balance = balanceByAccount[account.id] ?? account.startingBalance;
                return (
                  <div key={account.id} className="flex items-center gap-3">
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", CATEGORY_COLOR_CLASSES[colorKey].dot)} />
                    <span className="min-w-0 flex-1 truncate text-sm text-charcoal-800">{account.name}</span>
                    <span className="shrink-0 text-xs text-charcoal-600/60">{ACCOUNT_TYPE_LABELS[account.type]}</span>
                    <span
                      className={cn(
                        "w-24 shrink-0 text-right text-sm font-medium",
                        balance >= 0 ? "text-moss-600" : "text-clay-500"
                      )}
                    >
                      {currency.format(balance)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-xs font-medium tracking-wide text-charcoal-600/70 uppercase">
          Income vs. expenses
        </h2>
        <div className="rounded-lg border border-walnut-500/15 bg-parchment-paper p-4 shadow-soft">
          <SpendingTrendChart data={monthlyStats} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-xs font-medium tracking-wide text-charcoal-600/70 uppercase">
          Spending by category
        </h2>
        <div className="rounded-lg border border-walnut-500/15 bg-parchment-paper p-3 shadow-soft">
          {categoriesWithSpend.length === 0 ? (
            <p className="px-2 py-4 text-sm text-charcoal-600/50">Nothing categorized yet this month.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {categoriesWithSpend.map(({ category, spent }) => {
                const colorKey = categoryColorKey(category.color);
                const budget = category.budgetMonthly;
                const pct =
                  budget && budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : spent > 0 ? 100 : 0;
                return (
                  <div key={category.id} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 truncate text-sm text-charcoal-800">{category.name}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-canopy-800/8">
                      <div
                        className={cn("h-full rounded-full", CATEGORY_COLOR_CLASSES[colorKey].dot)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-32 shrink-0 text-right text-xs text-charcoal-600/60">
                      {currency.format(spent)}
                      {budget ? ` of ${currency.format(budget)}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-xs font-medium tracking-wide text-charcoal-600/70 uppercase">
          Unpaid bills{unpaid.length > 0 ? ` · ${unpaid.length}` : ""}
        </h2>
        <div className="rounded-lg border border-walnut-500/15 bg-parchment-paper p-2 shadow-soft">
          {unpaid.length === 0 ? (
            <p className="px-2 py-4 text-sm text-charcoal-600/50">Nothing outstanding.</p>
          ) : (
            unpaid.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-canopy-800/5"
              >
                <button
                  onClick={() => handleMarkPaid(t)}
                  aria-label={`Mark ${t.description} paid`}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-walnut-500/40 transition-colors hover:border-moss-500"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-charcoal-800">{t.description}</span>
                <span className="shrink-0 text-xs text-charcoal-600/60">{format(new Date(t.date), "MMM d")}</span>
                <span className="w-24 shrink-0 text-right text-sm font-medium text-clay-500">
                  {currency.format(t.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
