"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TextInput, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_ORDER, CATEGORY_COLOR_CLASSES, CATEGORY_COLOR_KEYS } from "@/types";
import type { AccountType, CategoryColorKey } from "@/types";

export function AddAccountForm({
  onAdd,
}: {
  onAdd: (data: {
    name: string;
    type: AccountType;
    color: CategoryColorKey;
    startingBalance: number;
  }) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("CHECKING");
  const [color, setColor] = useState<CategoryColorKey>("moss");
  const [startingBalance, setStartingBalance] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        type,
        color,
        startingBalance: startingBalance ? Number(startingBalance) : 0,
      });
      setName("");
      setType("CHECKING");
      setColor("moss");
      setStartingBalance("");
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
          placeholder="Account name…"
          className="h-9 min-w-[160px] flex-1"
        />
        <Select value={type} onChange={(e) => setType(e.target.value as AccountType)} className="h-9 w-32">
          {ACCOUNT_TYPE_ORDER.map((t) => (
            <option key={t} value={t}>
              {ACCOUNT_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        <TextInput
          type="number"
          inputMode="decimal"
          step="0.01"
          value={startingBalance}
          onChange={(e) => setStartingBalance(e.target.value)}
          placeholder="Starting balance"
          className="h-9 w-40"
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
