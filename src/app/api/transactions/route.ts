import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Repeat, TransactionType } from "@prisma/client";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    include: { category: true, account: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { description, amount, type, date, accountId, notes, categoryId, repeat, paid } = body ?? {};

  if (!description || typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }
  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
  }
  if (type !== "INCOME" && type !== "EXPENSE") {
    return NextResponse.json({ error: "type must be INCOME or EXPENSE" }, { status: 400 });
  }
  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }
  if (!accountId || typeof accountId !== "string") {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    return NextResponse.json({ error: "That account doesn't exist." }, { status: 400 });
  }

  const repeatValue = (repeat as Repeat) ?? "NONE";
  // One-off entries log something that already happened, so they're paid
  // by default. Recurring bills start unpaid until settled for that period.
  const paidValue = paid !== undefined ? Boolean(paid) : repeatValue === "NONE";

  const transaction = await prisma.transaction.create({
    data: {
      description: description.trim(),
      amount: amountNum,
      type: type as TransactionType,
      date: new Date(date),
      accountId,
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      categoryId: typeof categoryId === "string" && categoryId ? categoryId : null,
      repeat: repeatValue,
      paid: paidValue,
    },
    include: { category: true, account: true },
  });
  return NextResponse.json(transaction, { status: 201 });
}
