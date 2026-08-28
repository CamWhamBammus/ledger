import { NextResponse } from "next/server";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/db";

const MONTHS = 6;

export async function GET() {
  const now = new Date();
  const months = Array.from({ length: MONTHS }, (_, i) => subMonths(now, MONTHS - 1 - i));

  const stats = await Promise.all(
    months.map(async (monthDate) => {
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const transactions = await prisma.transaction.findMany({
        where: { paid: true, date: { gte: start, lte: end } },
        select: { type: true, amount: true },
      });
      const income = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
      return { month: format(start, "yyyy-MM"), label: format(start, "MMM"), income, expense };
    })
  );

  return NextResponse.json(stats);
}
