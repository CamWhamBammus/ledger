"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_COLOR_CLASSES, categoryColorKey } from "@/types";
import type { Category } from "@/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function CategoryRow({
  category,
  spentThisMonth,
  onUpdateBudget,
  onDelete,
}: {
  category: Category;
  spentThisMonth: number;
  onUpdateBudget: (budgetMonthly: number | null) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(category.budgetMonthly?.toString() ?? "");
  const colorKey = categoryColorKey(category.color);
  const budget = category.budgetMonthly;
  const pct = budget && budget > 0 ? Math.min(100, Math.round((spentThisMonth / budget) * 100)) : null;
  const over = budget !== null && budget !== undefined && spentThisMonth > budget;

  function commit() {
    const value = draft.trim() ? Number(draft) : null;
    onUpdateBudget(value);
    setEditing(false);
  }

  return (
    <div className="group flex flex-col gap-2 rounded-md px-2 py-2.5 transition-colors hover:bg-canopy-800/5">
      <div className="flex items-center gap-3">
        <span className={cn("h-3 w-3 shrink-0 rounded-full", CATEGORY_COLOR_CLASSES[colorKey].dot)} />
        <span className="min-w-0 flex-1 truncate text-sm text-charcoal-800">{category.name}</span>

        <span className="shrink-0 text-xs text-charcoal-600/60">{currency.format(spentThisMonth)}</span>

        {editing ? (
          <input
            autoFocus
            type="number"
            step="0.01"
            min="0"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            placeholder="No budget"
            className="h-7 w-24 rounded border border-walnut-500/25 bg-parchment-paper px-2 text-xs text-charcoal-800 focus:border-moss-500 focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="shrink-0 text-xs text-charcoal-600/60 underline decoration-dotted underline-offset-2 hover:text-charcoal-800"
          >
            {budget ? `of ${currency.format(budget)}` : "Set budget"}
          </button>
        )}

        <button
          onClick={onDelete}
          aria-label={`Delete ${category.name}`}
          className="shrink-0 rounded p-1 text-charcoal-600/40 opacity-0 transition-opacity hover:bg-clay-500/10 hover:text-clay-500 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {pct !== null && (
        <div className="ml-6 h-1.5 overflow-hidden rounded-full bg-canopy-800/8">
          <div
            className={cn("h-full rounded-full", over ? "bg-clay-500" : CATEGORY_COLOR_CLASSES[colorKey].dot)}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
