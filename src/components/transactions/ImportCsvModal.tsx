"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api-client";
import { parseTransactionCsv } from "@/lib/csv";
import type { ParsedCsvRow } from "@/lib/csv";
import type { Account } from "@/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function ImportCsvModal({
  accounts,
  onClose,
  onImported,
}: {
  accounts: Account[];
  onClose: () => void;
  onImported: () => void;
}) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedCsvRow[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const text = await file.text();
    const { rows: parsed, skipped: skippedCount } = parseTransactionCsv(text);
    if (parsed.length === 0) {
      setError("Couldn't find any valid rows in that file.");
      setFileName(null);
      setRows([]);
      return;
    }
    setFileName(file.name);
    setRows(parsed);
    setSkipped(skippedCount);
  }

  async function handleImport() {
    if (!accountId || rows.length === 0) return;
    setImporting(true);
    setError(null);
    try {
      await api.importTransactions({ accountId, rows });
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Import transactions" width="lg">
      <div className="flex flex-col gap-4">
        {accounts.length === 0 ? (
          <p className="text-sm text-charcoal-600">Add an account first.</p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-charcoal-600">Into</span>
              <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="h-9 w-48">
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </div>

            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-walnut-500/30 bg-parchment-paper px-4 py-8 text-center transition-colors hover:border-moss-500/50">
              <Upload size={20} className="text-charcoal-600/50" strokeWidth={1.75} />
              <span className="text-sm text-charcoal-600">
                {fileName ?? "Choose a CSV file — Date, Description, Amount"}
              </span>
              <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
            </label>

            {rows.length > 0 && (
              <>
                <p className="text-xs text-charcoal-600/60">
                  {rows.length} row{rows.length === 1 ? "" : "s"} ready
                  {skipped > 0 ? ` · ${skipped} skipped (couldn't parse)` : ""}
                </p>
                <div className="max-h-64 overflow-y-auto rounded-md border border-walnut-500/12">
                  {rows.slice(0, 50).map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 border-b border-walnut-500/8 px-3 py-1.5 text-xs last:border-b-0"
                    >
                      <span className="w-20 shrink-0 text-charcoal-600/60">
                        {format(new Date(row.date), "MMM d, yyyy")}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-charcoal-800">{row.description}</span>
                      <span
                        className={cn(
                          "w-20 shrink-0 text-right font-medium",
                          row.type === "INCOME" ? "text-moss-600" : "text-clay-500"
                        )}
                      >
                        {row.type === "INCOME" ? "+" : "−"}
                        {currency.format(row.amount)}
                      </span>
                    </div>
                  ))}
                  {rows.length > 50 && (
                    <p className="px-3 py-1.5 text-xs text-charcoal-600/50">and {rows.length - 50} more…</p>
                  )}
                </div>
              </>
            )}

            {error && <p className="text-sm text-clay-500">{error}</p>}
          </>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleImport} disabled={importing || rows.length === 0 || !accountId}>
            {importing ? "Importing…" : `Import ${rows.length || ""}`.trim()}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
