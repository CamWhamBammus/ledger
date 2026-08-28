import { format } from "date-fns";
import { dateKeyToDate } from "./dateKey";
import type { TransactionType, TransactionWithRelations } from "@/types";

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A bare "YYYY-MM-DD" string is parsed by `new Date()` as UTC midnight, which
 * then renders as the previous day in any timezone behind UTC. Route those
 * through the same local-midnight construction the rest of the app uses
 * (`dateKeyToDate`); other formats (`08/01/2026`, `Aug 1 2026`, ...) are
 * already parsed in local time by `Date.parse` and don't need it.
 */
function parseLocalDate(value: string): Date {
  return ISO_DATE_ONLY.test(value) ? dateKeyToDate(value) : new Date(value);
}

/**
 * Minimal RFC-4180-ish CSV parser — handles quoted fields, embedded commas,
 * embedded newlines inside quotes, and escaped `""` quotes. No dependency;
 * this is a small, bounded parsing job, not worth pulling in a package for.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((f) => f !== "")) rows.push(row);
  }

  return rows;
}

export interface ParsedCsvRow {
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
}

const HEADER_HINTS = {
  date: ["date", "posted"],
  description: ["description", "memo", "payee", "name"],
  amount: ["amount", "value"],
};

function findColumn(header: string[], hints: string[]): number {
  const lower = header.map((h) => h.trim().toLowerCase());
  for (const hint of hints) {
    const idx = lower.findIndex((h) => h.includes(hint));
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Bank CSV exports vary a lot — this handles the common shape (Date,
 * Description, Amount, in some order, with or without a header row, sign
 * on Amount deciding income vs expense) rather than every possible format.
 * Header names are matched loosely (`findColumn`); with no recognizable
 * header it falls back to Date/Description/Amount column order.
 */
export function parseTransactionCsv(text: string): { rows: ParsedCsvRow[]; skipped: number } {
  const table = parseCsv(text);
  if (table.length === 0) return { rows: [], skipped: 0 };

  const firstRow = table[0];
  const looksLikeHeader = Number.isNaN(Number(firstRow[2]?.replace(/[,$]/g, "")));

  let dateCol = 0;
  let descCol = 1;
  let amountCol = 2;
  let dataRows = table;

  if (looksLikeHeader) {
    const d = findColumn(firstRow, HEADER_HINTS.date);
    const desc = findColumn(firstRow, HEADER_HINTS.description);
    const amt = findColumn(firstRow, HEADER_HINTS.amount);
    dateCol = d !== -1 ? d : 0;
    descCol = desc !== -1 ? desc : 1;
    amountCol = amt !== -1 ? amt : 2;
    dataRows = table.slice(1);
  }

  const rows: ParsedCsvRow[] = [];
  let skipped = 0;

  for (const cells of dataRows) {
    const dateStr = cells[dateCol]?.trim();
    const description = cells[descCol]?.trim();
    const amountStr = cells[amountCol]?.trim().replace(/[,$]/g, "");
    const amountNum = amountStr ? Number(amountStr) : NaN;
    const date = dateStr ? parseLocalDate(dateStr) : null;

    if (!description || !Number.isFinite(amountNum) || amountNum === 0 || !date || Number.isNaN(date.getTime())) {
      skipped++;
      continue;
    }

    rows.push({
      description,
      amount: Math.abs(amountNum),
      type: amountNum < 0 ? "EXPENSE" : "INCOME",
      date: date.toISOString(),
    });
  }

  return { rows, skipped };
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function exportTransactionsToCsv(transactions: TransactionWithRelations[]) {
  const header = ["Date", "Description", "Account", "Category", "Type", "Amount", "Paid", "Repeat"];
  const rows = transactions.map((t) => [
    format(new Date(t.date), "yyyy-MM-dd"),
    t.description,
    t.account.name,
    t.category?.name ?? "",
    t.type,
    t.amount.toFixed(2),
    t.paid ? "yes" : "no",
    t.repeat,
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ledger-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
