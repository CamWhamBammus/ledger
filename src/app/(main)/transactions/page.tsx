import { prisma } from "@/lib/db";
import { TransactionsView } from "@/components/transactions/TransactionsView";

export default async function TransactionsPage() {
  const [transactions, categories, accounts] = await Promise.all([
    prisma.transaction.findMany({
      include: { category: true, account: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.account.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="paper-grain mx-auto min-h-screen max-w-3xl px-6 py-12">
      <TransactionsView initialTransactions={transactions} categories={categories} accounts={accounts} />
    </main>
  );
}
