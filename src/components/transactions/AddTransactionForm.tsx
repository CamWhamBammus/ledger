"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TextInput, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { dateKeyToDate, todayKey } from "@/lib/dateKey";
import { REPEAT_LABELS, REPEAT_ORDER } from "@/types";
import type { Account, Category, Repeat, TransactionType } from "@/types";

export function AddTransactionForm({
  categories,
  accounts,
  onAdd,
}: {
  categories: Category[];
  accounts: Account[];
  onAdd: (data: {
    description: string;
    amount: number;
    type: TransactionType;
    date: string;
    accountId: string;
    categoryId: string | null;
    repeat: Repeat;
  }) => Promise<void> | void;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [date, setDate] = useState(() => todayKey());
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState("");
  const [repeat, setRepeat] = useState<Repeat>("NONE");
  const [submitting, setSubmitting] = useState(false);

  if (accounts.length === 0) {
    return (
      <div className="rounded-lg border border-walnut-500/15 bg-parchment-paper p-4 text-center shadow-soft">
        <p className="text-sm text-charcoal-600">
          Add an account before logging transactions —{" "}
          <Link href="/accounts" className="font-medium text-moss-600 hover:underline">
            add one here
          </Link>
          .
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!description.trim() || !Number.isFinite(amountNum) || amountNum <= 0 || !accountId) return;
    setSubmitting(true);
    try {
      await onAdd({
        description: description.trim(),
        amount: amountNum,
        type,
        date: dateKeyToDate(date).toISOString(),
        accountId,
        categoryId: categoryId || null,
        repeat,
      });
      setDescription("");
      setAmount("");
      setRepeat("NONE");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-walnut-500/15 bg-parchment-paper p-3 shadow-soft"
    >
      <div className="flex flex-wrap items-center gap-2">
        <TextInput
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description…"
          className="h-9 min-w-[160px] flex-1"
        />
        <TextInput
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="h-9 w-28"
        />
        <div className="flex h-9 items-center rounded-md border border-walnut-500/25 bg-parchment-paper p-0.5">
          {(["EXPENSE", "INCOME"] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "h-full rounded px-3 text-sm transition-colors",
                type === t
                  ? t === "INCOME"
                    ? "bg-moss-600 text-parchment-50"
                    : "bg-clay-500 text-parchment-50"
                  : "text-charcoal-600 hover:bg-canopy-800/5"
              )}
            >
              {t === "INCOME" ? "Income" : "Expense"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 w-40" />
        <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="h-9 w-36">
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-9 w-40">
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          value={repeat}
          onChange={(e) => setRepeat(e.target.value as Repeat)}
          className="h-9 w-36"
          title="Marks this as a recurring bill"
        >
          {REPEAT_ORDER.map((r) => (
            <option key={r} value={r}>
              {REPEAT_LABELS[r]}
            </option>
          ))}
        </Select>
        <Button
          type="submit"
          size="sm"
          disabled={submitting || !description.trim() || !amount}
          className="ml-auto"
        >
          <Plus size={14} />
          Add
        </Button>
      </div>
    </form>
  );
}
