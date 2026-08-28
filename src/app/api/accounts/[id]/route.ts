import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { accountTypeOrDefault, categoryColorKey } from "@/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, type, color, startingBalance } = body ?? {};

  const data: { name?: string; type?: ReturnType<typeof accountTypeOrDefault>; color?: string; startingBalance?: number } =
    {};

  if (name !== undefined) data.name = String(name).trim();
  if (type !== undefined) data.type = accountTypeOrDefault(type);
  if (color !== undefined) data.color = categoryColorKey(String(color));
  if (startingBalance !== undefined) data.startingBalance = Number(startingBalance);

  const account = await prisma.account.update({ where: { id }, data });
  return NextResponse.json(account);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const transactionCount = await prisma.transaction.count({ where: { accountId: id } });
  if (transactionCount > 0) {
    return NextResponse.json(
      {
        error: `This account still has ${transactionCount} transaction${transactionCount === 1 ? "" : "s"}. Delete or reassign them first.`,
      },
      { status: 409 }
    );
  }

  await prisma.account.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
