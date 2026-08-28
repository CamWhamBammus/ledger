import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { accountTypeOrDefault, categoryColorKey } from "@/types";

export async function GET() {
  const accounts = await prisma.account.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(accounts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, type, color, startingBalance } = body ?? {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const account = await prisma.account.create({
    data: {
      name: name.trim(),
      type: accountTypeOrDefault(type),
      color: categoryColorKey(typeof color === "string" ? color : ""),
      startingBalance:
        startingBalance === null || startingBalance === undefined || startingBalance === ""
          ? 0
          : Number(startingBalance),
    },
  });
  return NextResponse.json(account, { status: 201 });
}
