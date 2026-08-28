import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nextDueDate } from "@/lib/recurrence";
import type { Repeat, TransactionType } from "@prisma/client";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { description, amount, type, date, accountId, notes, categoryId, repeat, paid } = body ?? {};

  const data: {
    description?: string;
    amount?: number;
    type?: TransactionType;
    date?: Date;
    accountId?: string;
    notes?: string | null;
    categoryId?: string | null;
    repeat?: Repeat;
    paid?: boolean;
  } = {};

  if (description !== undefined) data.description = String(description).trim();
  if (amount !== undefined) data.amount = Number(amount);
  if (type !== undefined) data.type = type as TransactionType;
  if (date !== undefined) data.date = new Date(date);
  if (accountId !== undefined && accountId) data.accountId = String(accountId);
  if (notes !== undefined) data.notes = notes && String(notes).trim() ? String(notes).trim() : null;
  if (categoryId !== undefined) data.categoryId = categoryId || null;
  if (repeat !== undefined) data.repeat = repeat as Repeat;
  if (paid !== undefined) data.paid = Boolean(paid);

  const transaction = await prisma.transaction.update({
    where: { id },
    data,
    include: { category: true, account: true },
  });

  // Settling a repeating bill leaves this instance as paid history and
  // spawns the next occurrence, unpaid, with the date advanced — mirrors
  // Almanac's recurring Task completion pattern exactly.
  if (data.paid && transaction.repeat !== "NONE") {
    await prisma.transaction.create({
      data: {
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        date: nextDueDate(transaction.date, transaction.repeat),
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        repeat: transaction.repeat,
        paid: false,
      },
    });
  }

  return NextResponse.json(transaction);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
