"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCOUNT_TYPE_LABELS, CATEGORY_COLOR_CLASSES, categoryColorKey } from "@/types";
import type { Account } from "@/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function AccountRow({
  account,
  balance,
  onDelete,
}: {
  account: Account;
  balance: number;
  onDelete: () => void;
}) {
  const colorKey = categoryColorKey(account.color);

  return (
    <div className="group flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-canopy-800/5">
      <span className={cn("h-3 w-3 shrink-0 rounded-full", CATEGORY_COLOR_CLASSES[colorKey].dot)} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-charcoal-800">{account.name}</p>
        <p className="text-xs text-charcoal-600/60">{ACCOUNT_TYPE_LABELS[account.type]}</p>
      </div>
      <span className={cn("shrink-0 text-sm font-medium", balance >= 0 ? "text-moss-600" : "text-clay-500")}>
        {currency.format(balance)}
      </span>
      <button
        onClick={onDelete}
        aria-label={`Delete ${account.name}`}
        className="shrink-0 rounded p-1 text-charcoal-600/40 opacity-0 transition-opacity hover:bg-clay-500/10 hover:text-clay-500 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
