import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { TransactionType } from "@prisma/client";

interface ImportRow {
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { accountId, rows } = body ?? {};

  if (!accountId || typeof accountId !== "string") {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "rows must be a non-empty array" }, { status: 400 });
  }

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    return NextResponse.json({ error: "That account doesn't exist." }, { status: 400 });
  }

  const valid: ImportRow[] = [];
  for (const row of rows) {
    const description = typeof row?.description === "string" ? row.description.trim() : "";
    const amount = Number(row?.amount);
    const type = row?.type === "INCOME" ? "INCOME" : row?.type === "EXPENSE" ? "EXPENSE" : null;
    const date = row?.date ? new Date(row.date) : null;
    if (!description || !Number.isFinite(amount) || amount <= 0 || !type || !date || Number.isNaN(date.getTime())) {
      continue;
    }
    valid.push({ description, amount, type, date: date.toISOString() });
  }

  if (valid.length === 0) {
    return NextResponse.json({ error: "None of the rows were valid." }, { status: 400 });
  }

  const result = await prisma.transaction.createMany({
    data: valid.map((row) => ({
      description: row.description,
      amount: row.amount,
      type: row.type,
      date: new Date(row.date),
      accountId,
      paid: true,
      repeat: "NONE" as const,
    })),
  });

  return NextResponse.json({ created: result.count }, { status: 201 });
}
