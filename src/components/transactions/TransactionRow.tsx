"use client";

import { useState } from "react";
import { Check, Repeat as RepeatIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CATEGORY_COLOR_CLASSES, categoryColorKey } from "@/types";
import type { TransactionWithRelations } from "@/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function TransactionRow({
  transaction,
  onTogglePaid,
  onDelete,
}: {
  transaction: TransactionWithRelations;
  onTogglePaid: () => void;
  onDelete: () => void;
}) {
  const [justSettled, setJustSettled] = useState(false);
  const isIncome = transaction.type === "INCOME";

  function handleToggle() {
    if (!transaction.paid) {
      setJustSettled(true);
      setTimeout(() => setJustSettled(false), 320);
    }
    onTogglePaid();
  }

  return (
    <div className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-canopy-800/5">
      <button
        onClick={handleToggle}
        aria-label={transaction.paid ? "Mark unpaid" : "Mark paid"}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          transaction.paid
            ? "border-moss-600 bg-moss-600 text-parchment-50"
            : "border-walnut-500/40 hover:border-moss-500",
          justSettled && "completion-pop"
        )}
      >
        {transaction.paid && <Check size={12} strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-charcoal-800">{transaction.description}</p>
        {transaction.notes && <p className="truncate text-xs text-charcoal-600/60">{transaction.notes}</p>}
      </div>

      {transaction.repeat !== "NONE" && (
        <RepeatIcon
          size={12}
          className="shrink-0 text-charcoal-600/40"
          strokeWidth={2}
          aria-label={`Repeats ${transaction.repeat.toLowerCase()}`}
        />
      )}

      <span className="hidden shrink-0 truncate text-xs text-charcoal-600/50 sm:block sm:max-w-[6rem]">
        {transaction.account.name}
      </span>

      {transaction.category && (
        <span
          className={cn(
            "shrink-0 rounded px-2 py-0.5 text-xs font-medium",
            CATEGORY_COLOR_CLASSES[categoryColorKey(transaction.category.color)].bg,
            CATEGORY_COLOR_CLASSES[categoryColorKey(transaction.category.color)].text
          )}
        >
          {transaction.category.name}
        </span>
      )}

      <span className="w-16 shrink-0 text-right text-xs text-charcoal-600/60">
        {format(new Date(transaction.date), "MMM d")}
      </span>

      <span className={cn("w-24 shrink-0 text-right text-sm font-medium", isIncome ? "text-moss-600" : "text-clay-500")}>
        {isIncome ? "+" : "−"}
        {currency.format(transaction.amount)}
      </span>

      <button
        onClick={onDelete}
        aria-label={`Delete ${transaction.description}`}
        className="shrink-0 rounded p-1 text-charcoal-600/40 opacity-0 transition-opacity hover:bg-clay-500/10 hover:text-clay-500 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
