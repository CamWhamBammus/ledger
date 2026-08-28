"use client";

import { useState } from "react";
import { Download, Receipt, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { TransactionRow } from "@/components/transactions/TransactionRow";
import { AddTransactionForm } from "@/components/transactions/AddTransactionForm";
import { ImportCsvModal } from "@/components/transactions/ImportCsvModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { exportTransactionsToCsv } from "@/lib/csv";
import type { Account, Category, Repeat, TransactionType, TransactionWithRelations } from "@/types";

type FilterKey = "all" | "income" | "expense" | "unpaid";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "income", label: "Income" },
  { key: "expense", label: "Expense" },
  { key: "unpaid", label: "Unpaid" },
];

export function TransactionsView({
  initialTransactions,
  categories,
  accounts,
}: {
  initialTransactions: TransactionWithRelations[];
  categories: Category[];
  accounts: Account[];
}) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [importOpen, setImportOpen] = useState(false);

  const byAccount = accountFilter === "all" ? transactions : transactions.filter((t) => t.accountId === accountFilter);

  const filtered = byAccount.filter((t) => {
    switch (filter) {
      case "income":
        return t.type === "INCOME";
      case "expense":
        return t.type === "EXPENSE";
      case "unpaid":
        return !t.paid;
      default:
        return true;
    }
  });

  async function handleAdd(data: {
    description: string;
    amount: number;
    type: TransactionType;
    date: string;
    accountId: string;
    categoryId: string | null;
    repeat: Repeat;
  }) {
    const transaction = await api.createTransaction(data);
    setTransactions((prev) => [transaction, ...prev]);
  }

  async function handleTogglePaid(transaction: TransactionWithRelations) {
    const updated = await api.updateTransaction(transaction.id, { paid: !transaction.paid });
    // A settled recurring transaction spawns a new one server-side, so the
    // full list is re-fetched to pick that up rather than patching in place.
    if (!transaction.paid && transaction.repeat !== "NONE") {
      const fresh = await api.listTransactions();
      setTransactions(fresh);
      return;
    }
    setTransactions((prev) => prev.map((t) => (t.id === transaction.id ? updated : t)));
  }

  async function handleDelete(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await api.deleteTransaction(id);
  }

  async function handleImported() {
    setImportOpen(false);
    const fresh = await api.listTransactions();
    setTransactions(fresh);
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-canopy-900">Transactions</h1>
          <p className="mt-1 text-sm text-charcoal-600">Everything that&rsquo;s moved through the books.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
            <Upload size={13} />
            Import
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportTransactionsToCsv(filtered)}
            disabled={filtered.length === 0}
          >
            <Download size={13} />
            Export
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <AddTransactionForm categories={categories} accounts={accounts} onAdd={handleAdd} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition-colors",
                filter === f.key
                  ? "bg-moss-600 text-parchment-50"
                  : "bg-canopy-800/6 text-charcoal-600 hover:bg-canopy-800/12"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {accounts.length > 1 && (
          <Select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="ml-auto h-8 w-auto text-sm"
          >
            <option value="all">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-walnut-500/15 bg-parchment-paper p-2 shadow-soft">
        {filtered.length === 0 ? (
          <EmptyState icon={Receipt} message="Nothing here." />
        ) : (
          filtered.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              onTogglePaid={() => handleTogglePaid(transaction)}
              onDelete={() => handleDelete(transaction.id)}
            />
          ))
        )}
      </div>

      {importOpen && (
        <ImportCsvModal accounts={accounts} onClose={() => setImportOpen(false)} onImported={handleImported} />
      )}
    </div>
  );
}
