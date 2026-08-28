import type { Account, AccountType, Category, Repeat, Transaction, TransactionType } from "@prisma/client";

export type { Account, AccountType, Category, Repeat, Transaction, TransactionType };

export type TransactionWithRelations = Transaction & { category: Category | null; account: Account };

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CHECKING: "Checking",
  SAVINGS: "Savings",
  CREDIT: "Credit",
  CASH: "Cash",
  OTHER: "Other",
};

export const ACCOUNT_TYPE_ORDER: AccountType[] = ["CHECKING", "SAVINGS", "CREDIT", "CASH", "OTHER"];

export function accountTypeOrDefault(value: unknown): AccountType {
  return typeof value === "string" && (ACCOUNT_TYPE_ORDER as string[]).includes(value)
    ? (value as AccountType)
    : "OTHER";
}

export const REPEAT_LABELS: Record<Repeat, string> = {
  NONE: "Doesn't repeat",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export const REPEAT_ORDER: Repeat[] = ["NONE", "WEEKLY", "MONTHLY", "YEARLY"];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: "Income",
  EXPENSE: "Expense",
};

/**
 * Category colors are always one of these palette keys — never an
 * arbitrary hex value — so every category swatch stays inside the same
 * forest/parchment design tokens the rest of the cabin uses.
 */
export const CATEGORY_COLOR_KEYS = ["moss", "walnut", "clay", "amber", "sage", "olive", "tan"] as const;
export type CategoryColorKey = (typeof CATEGORY_COLOR_KEYS)[number];

export const CATEGORY_COLOR_CLASSES: Record<CategoryColorKey, { dot: string; bg: string; text: string }> = {
  moss: { dot: "bg-moss-600", bg: "bg-moss-600/12", text: "text-moss-600" },
  walnut: { dot: "bg-walnut-500", bg: "bg-walnut-500/12", text: "text-walnut-700" },
  clay: { dot: "bg-clay-500", bg: "bg-clay-500/12", text: "text-clay-500" },
  amber: { dot: "bg-amber-500", bg: "bg-amber-500/12", text: "text-amber-500" },
  sage: { dot: "bg-sage-400", bg: "bg-sage-400/16", text: "text-canopy-800" },
  olive: { dot: "bg-olive-500", bg: "bg-olive-500/14", text: "text-olive-500" },
  tan: { dot: "bg-tan-400", bg: "bg-tan-400/18", text: "text-walnut-700" },
};

export function categoryColorKey(color: string): CategoryColorKey {
  return (CATEGORY_COLOR_KEYS as readonly string[]).includes(color) ? (color as CategoryColorKey) : "moss";
}
