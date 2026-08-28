"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { api } from "@/lib/api-client";
import { AddAccountForm } from "@/components/accounts/AddAccountForm";
import { AccountRow } from "@/components/accounts/AccountRow";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Account, AccountType, CategoryColorKey } from "@/types";

export function AccountsView({
  initialAccounts,
  balanceByAccount,
}: {
  initialAccounts: Account[];
  balanceByAccount: Record<string, number>;
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [balances, setBalances] = useState(balanceByAccount);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(data: {
    name: string;
    type: AccountType;
    color: CategoryColorKey;
    startingBalance: number;
  }) {
    const account = await api.createAccount(data);
    setAccounts((prev) => [...prev, account].sort((a, b) => a.name.localeCompare(b.name)));
    setBalances((prev) => ({ ...prev, [account.id]: account.startingBalance }));
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await api.deleteAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that account.");
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-canopy-900">Accounts</h1>
      <p className="mt-1 text-sm text-charcoal-600">Where the money actually lives.</p>

      <div className="mt-6">
        <AddAccountForm onAdd={handleAdd} />
      </div>

      {error && <p className="mt-3 rounded-md border border-clay-500/20 bg-clay-500/5 px-3 py-2 text-xs text-clay-500">{error}</p>}

      <div className="mt-4 rounded-lg border border-walnut-500/15 bg-parchment-paper p-2 shadow-soft">
        {accounts.length === 0 ? (
          <EmptyState icon={Landmark} message="Nothing here." />
        ) : (
          accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              balance={balances[account.id] ?? account.startingBalance}
              onDelete={() => handleDelete(account.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
