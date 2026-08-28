import { NextResponse } from "next/server";
import { endOfMonth, startOfMonth } from "date-fns";
import { prisma } from "@/lib/db";

export async function GET() {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const [monthTransactions, unpaidBillsCount] = await Promise.all([
    prisma.transaction.findMany({ where: { paid: true, date: { gte: start, lte: end } } }),
    prisma.transaction.count({ where: { paid: false } }),
  ]);

  const incomeThisMonth = monthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseThisMonth = monthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  return NextResponse.json({
    incomeThisMonth,
    expenseThisMonth,
    netThisMonth: incomeThisMonth - expenseThisMonth,
    unpaidBillsCount,
  });
}
