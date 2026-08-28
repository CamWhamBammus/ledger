"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CATEGORY_COLOR_CLASSES, CATEGORY_COLOR_KEYS } from "@/types";
import type { CategoryColorKey } from "@/types";

export function AddCategoryForm({
  onAdd,
}: {
  onAdd: (data: { name: string; color: CategoryColorKey; budgetMonthly: number | null }) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<CategoryColorKey>("moss");
  const [budget, setBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        color,
        budgetMonthly: budget ? Number(budget) : null,
      });
      setName("");
      setBudget("");
      setColor("moss");
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name…"
          className="h-9 min-w-[160px] flex-1"
        />
        <TextInput
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Monthly budget (optional)"
          className="h-9 w-52"
        />
        <Button type="submit" size="sm" disabled={submitting || !name.trim()}>
          <Plus size={14} />
          Add
        </Button>
      </div>
      <div className="flex items-center gap-1.5">
        {CATEGORY_COLOR_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setColor(key)}
            aria-label={key}
            title={key}
            className={cn(
              "h-6 w-6 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-parchment-paper transition-all",
              CATEGORY_COLOR_CLASSES[key].dot,
              color === key ? "ring-canopy-800/40" : "ring-transparent"
            )}
          />
        ))}
      </div>
    </form>
  );
}
