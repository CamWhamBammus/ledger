import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { categoryColorKey } from "@/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, color, budgetMonthly } = body ?? {};

  const data: { name?: string; color?: string; budgetMonthly?: number | null } = {};

  if (name !== undefined) data.name = String(name).trim();
  if (color !== undefined) data.color = categoryColorKey(String(color));
  if (budgetMonthly !== undefined) {
    data.budgetMonthly = budgetMonthly === null || budgetMonthly === "" ? null : Number(budgetMonthly);
  }

  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json(category);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
