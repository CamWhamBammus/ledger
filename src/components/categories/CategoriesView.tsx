"use client";

import { useState } from "react";
import { Tags } from "lucide-react";
import { api } from "@/lib/api-client";
import { AddCategoryForm } from "@/components/categories/AddCategoryForm";
import { CategoryRow } from "@/components/categories/CategoryRow";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Category, CategoryColorKey } from "@/types";

export function CategoriesView({
  initialCategories,
  spentByCategory,
}: {
  initialCategories: Category[];
  spentByCategory: Record<string, number>;
}) {
  const [categories, setCategories] = useState(initialCategories);

  async function handleAdd(data: { name: string; color: CategoryColorKey; budgetMonthly: number | null }) {
    const category = await api.createCategory(data);
    setCategories((prev) => [...prev, category].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function handleUpdateBudget(id: string, budgetMonthly: number | null) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, budgetMonthly } : c)));
    await api.updateCategory(id, { budgetMonthly });
  }

  async function handleDelete(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    await api.deleteCategory(id);
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-canopy-900">Categories</h1>
      <p className="mt-1 text-sm text-charcoal-600">
        How the spending gets sorted, and what it&rsquo;s allowed to cost.
      </p>

      <div className="mt-6">
        <AddCategoryForm onAdd={handleAdd} />
      </div>

      <div className="mt-4 rounded-lg border border-walnut-500/15 bg-parchment-paper p-2 shadow-soft">
        {categories.length === 0 ? (
          <EmptyState icon={Tags} message="Nothing here." />
        ) : (
          categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              spentThisMonth={spentByCategory[category.id] ?? 0}
              onUpdateBudget={(budgetMonthly) => handleUpdateBudget(category.id, budgetMonthly)}
              onDelete={() => handleDelete(category.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
