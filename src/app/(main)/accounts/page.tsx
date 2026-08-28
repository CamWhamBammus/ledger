import { prisma } from "@/lib/db";
import { AccountsView } from "@/components/accounts/AccountsView";

export default async function AccountsPage() {
  const [accounts, paidTransactions] = await Promise.all([
    prisma.account.findMany({ orderBy: { name: "asc" } }),
    prisma.transaction.findMany({ where: { paid: true }, select: { accountId: true, type: true, amount: true } }),
  ]);

  const balanceByAccount: Record<string, number> = {};
  for (const account of accounts) {
    balanceByAccount[account.id] = account.startingBalance;
  }
  for (const t of paidTransactions) {
    balanceByAccount[t.accountId] = (balanceByAccount[t.accountId] ?? 0) + (t.type === "INCOME" ? t.amount : -t.amount);
  }

  return (
    <main className="paper-grain mx-auto min-h-screen max-w-2xl px-6 py-12">
      <AccountsView initialAccounts={accounts} balanceByAccount={balanceByAccount} />
    </main>
  );
}
