import { endOfMonth, startOfMonth } from "date-fns";
import { prisma } from "@/lib/db";
import { CategoriesView } from "@/components/categories/CategoriesView";

export default async function CategoriesPage() {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const [categories, monthExpenses] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.transaction.findMany({
      where: { type: "EXPENSE", paid: true, date: { gte: start, lte: end }, categoryId: { not: null } },
    }),
  ]);

  const spentByCategory: Record<string, number> = {};
  for (const t of monthExpenses) {
    if (!t.categoryId) continue;
    spentByCategory[t.categoryId] = (spentByCategory[t.categoryId] ?? 0) + t.amount;
  }

  return (
    <main className="paper-grain mx-auto min-h-screen max-w-2xl px-6 py-12">
      <CategoriesView initialCategories={categories} spentByCategory={spentByCategory} />
    </main>
  );
}
