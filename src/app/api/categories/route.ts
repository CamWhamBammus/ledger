import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { categoryColorKey } from "@/types";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, color, budgetMonthly } = body ?? {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      color: categoryColorKey(typeof color === "string" ? color : ""),
      budgetMonthly:
        budgetMonthly === null || budgetMonthly === undefined || budgetMonthly === ""
          ? null
          : Number(budgetMonthly),
    },
  });
  return NextResponse.json(category, { status: 201 });
}
