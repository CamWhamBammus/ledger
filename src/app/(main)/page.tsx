import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/db";
import { OverviewView } from "@/components/overview/OverviewView";

const TREND_MONTHS = 6;

export default async function OverviewPage() {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const trendStart = startOfMonth(subMonths(now, TREND_MONTHS - 1));

  const [monthTransactions, unpaidBillsCount, unpaid, categories, monthExpenses, accounts, paidTransactions, trendTransactions] =
    await Promise.all([
      prisma.transaction.findMany({ where: { paid: true, date: { gte: start, lte: end } } }),
      prisma.transaction.count({ where: { paid: false } }),
      prisma.transaction.findMany({
        where: { paid: false },
        include: { category: true, account: true },
        orderBy: { date: "asc" },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.transaction.findMany({
        where: { type: "EXPENSE", paid: true, date: { gte: start, lte: end }, categoryId: { not: null } },
      }),
      prisma.account.findMany({ orderBy: { name: "asc" } }),
      prisma.transaction.findMany({ where: { paid: true }, select: { accountId: true, type: true, amount: true } }),
      prisma.transaction.findMany({
        where: { paid: true, date: { gte: trendStart, lte: end } },
        select: { type: true, amount: true, date: true },
      }),
    ]);

  const incomeThisMonth = monthTransactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expenseThisMonth = monthTransactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const spentByCategory: Record<string, number> = {};
  for (const t of monthExpenses) {
    if (!t.categoryId) continue;
    spentByCategory[t.categoryId] = (spentByCategory[t.categoryId] ?? 0) + t.amount;
  }

  const balanceByAccount: Record<string, number> = {};
  for (const account of accounts) {
    balanceByAccount[account.id] = account.startingBalance;
  }
  for (const t of paidTransactions) {
    balanceByAccount[t.accountId] = (balanceByAccount[t.accountId] ?? 0) + (t.type === "INCOME" ? t.amount : -t.amount);
  }

  const monthlyStats = Array.from({ length: TREND_MONTHS }, (_, i) => {
    const monthDate = subMonths(now, TREND_MONTHS - 1 - i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const inMonth = trendTransactions.filter((t) => t.date >= monthStart && t.date <= monthEnd);
    return {
      month: format(monthStart, "yyyy-MM"),
      label: format(monthStart, "MMM"),
      income: inMonth.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
      expense: inMonth.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0),
    };
  });

  return (
    <main className="paper-grain mx-auto min-h-screen max-w-2xl px-6 py-12">
      <OverviewView
        initialSummary={{
          incomeThisMonth,
          expenseThisMonth,
          netThisMonth: incomeThisMonth - expenseThisMonth,
          unpaidBillsCount,
        }}
        initialUnpaid={unpaid}
        categories={categories}
        spentByCategory={spentByCategory}
        accounts={accounts}
        balanceByAccount={balanceByAccount}
        monthlyStats={monthlyStats}
      />
    </main>
  );
}
